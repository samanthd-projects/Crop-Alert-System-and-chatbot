package com.farmer.cropmonitoring.controller;

import com.farmer.cropmonitoring.dto.WeatherResponse;
import com.farmer.cropmonitoring.service.RuleEngineService;
import com.farmer.cropmonitoring.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/weather")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WeatherController {
    private final WeatherService weatherService;
    private final RuleEngineService ruleEngineService;
    
    @GetMapping("/{location}")
    public ResponseEntity<WeatherResponse> getCurrentWeather(@PathVariable String location) {
        try {
            WeatherResponse weather = weatherService.fetchCurrentWeather(location);
            
            // Check rules and generate alerts
            ruleEngineService.checkWeatherRules(location, weather);
            
            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}

