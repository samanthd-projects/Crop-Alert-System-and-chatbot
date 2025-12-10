package com.farmer.cropmonitoring.controller;

import com.farmer.cropmonitoring.dto.ErrorResponse;
import com.farmer.cropmonitoring.dto.FarmerLoginRequest;
import com.farmer.cropmonitoring.dto.FarmerResponse;
import com.farmer.cropmonitoring.dto.FarmerSignupRequest;
import com.farmer.cropmonitoring.dto.LoginResponse;
import com.farmer.cropmonitoring.dto.WeatherResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import com.farmer.cropmonitoring.service.FarmerService;
import com.farmer.cropmonitoring.service.RuleEngineService;
import com.farmer.cropmonitoring.service.WeatherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/farmer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FarmerController {
    private final FarmerService farmerService;
    private final WeatherService weatherService;
    private final RuleEngineService ruleEngineService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody FarmerSignupRequest request) {
        try {
            FarmerResponse response = farmerService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // Return error message in response body for debugging
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage() != null ? e.getMessage() : "Signup failed"));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody FarmerLoginRequest request) {
        try {
            LoginResponse response = farmerService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Return error message in response body for debugging
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage() != null ? e.getMessage() : "Invalid email or password"));
        }
    }
    
    @org.springframework.web.bind.annotation.ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(errorMessage));
    }

    /**
     * Authenticated profile endpoint.
     * Uses JWT token to identify current user; no change-password field exposed here.
     */
    @GetMapping("/profile")
    public ResponseEntity<FarmerResponse> getProfile() {
        try {
            FarmerResponse response = farmerService.getCurrentFarmerProfile();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Get current weather for the authenticated user's stored location
     * and run rule engine to generate alerts.
     */
    @GetMapping("/profile/weather")
    public ResponseEntity<WeatherResponse> getProfileWeather() {
        try {
            FarmerResponse farmer = farmerService.getCurrentFarmerProfile();
            WeatherResponse weather = weatherService.fetchCurrentWeather(farmer.getLocation());
            // Check rules and generate alerts for this location
            ruleEngineService.checkWeatherRules(farmer.getLocation(), weather);
            return ResponseEntity.ok(weather);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}

