package com.farmer.cropmonitoring.service;

import com.farmer.cropmonitoring.dto.FarmerLoginRequest;
import com.farmer.cropmonitoring.dto.FarmerResponse;
import com.farmer.cropmonitoring.dto.FarmerSignupRequest;
import com.farmer.cropmonitoring.dto.LoginResponse;
import com.farmer.cropmonitoring.entity.Farmer;
import com.farmer.cropmonitoring.repository.FarmerRepository;
import com.farmer.cropmonitoring.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FarmerService {
    private final FarmerRepository farmerRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    public FarmerResponse signup(FarmerSignupRequest request) {
        if (farmerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        Farmer farmer = new Farmer();
        farmer.setName(request.getName());
        farmer.setEmail(request.getEmail());
        farmer.setPhone(request.getPhone());
        farmer.setPassword(passwordEncoder.encode(request.getPassword()));
        farmer.setLocation(request.getLocation());
        
        Farmer savedFarmer = farmerRepository.save(farmer);
        return mapToResponse(savedFarmer);
    }
    
    public LoginResponse login(FarmerLoginRequest request) {
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(request.getEmail());
        
        if (farmerOpt.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }
        
        Farmer farmer = farmerOpt.get();
        
        if (!passwordEncoder.matches(request.getPassword(), farmer.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(farmer.getEmail(), farmer.getId());
        FarmerResponse farmerResponse = mapToResponse(farmer);
        
        return new LoginResponse(token, farmerResponse);
    }

    /**
     * Get currently authenticated farmer (based on JWT token).
     */
    public FarmerResponse getCurrentFarmerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("No authenticated user");
        }

        String email = authentication.getName();
        Farmer farmer = farmerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));

        return mapToResponse(farmer);
    }
    
    public FarmerResponse getFarmerById(Long id) {
        Farmer farmer = farmerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farmer not found"));
        return mapToResponse(farmer);
    }
    
    public FarmerResponse updateFarmer(Long id, FarmerSignupRequest request) {
        Farmer farmer = farmerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Farmer not found"));
        
        // Check if email is being changed and if it's already taken
        if (!farmer.getEmail().equals(request.getEmail()) && 
            farmerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        farmer.setName(request.getName());
        farmer.setEmail(request.getEmail());
        farmer.setPhone(request.getPhone());
        farmer.setLocation(request.getLocation());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            farmer.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        Farmer updatedFarmer = farmerRepository.save(farmer);
        return mapToResponse(updatedFarmer);
    }
    
    private FarmerResponse mapToResponse(Farmer farmer) {
        return new FarmerResponse(
            farmer.getId(),
            farmer.getName(),
            farmer.getEmail(),
            farmer.getPhone(),
            farmer.getLocation()
        );
    }
}

