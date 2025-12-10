package com.farmer.cropmonitoring.controller;

import com.farmer.cropmonitoring.dto.CropRequest;
import com.farmer.cropmonitoring.dto.CropResponse;
import com.farmer.cropmonitoring.service.CropService;
import com.farmer.cropmonitoring.service.FarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crops")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CropController {
    private final CropService cropService;
    private final FarmerService farmerService;
    
    @PostMapping
    public ResponseEntity<CropResponse> addCrop(@Valid @RequestBody CropRequest request) {
        try {
            // Get farmer ID from JWT token
            Long farmerId = farmerService.getCurrentFarmerProfile().getId();
            CropResponse response = cropService.addCrop(farmerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<CropResponse>> getCropsByFarmer() {
        try {
            // Get farmer ID from JWT token
            Long farmerId = farmerService.getCurrentFarmerProfile().getId();
            List<CropResponse> crops = cropService.getCropsByFarmerId(farmerId);
            return ResponseEntity.ok(crops);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{cropId}")
    public ResponseEntity<CropResponse> getCrop(@PathVariable Long cropId) {
        try {
            CropResponse response = cropService.getCropById(cropId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @PutMapping("/{cropId}")
    public ResponseEntity<CropResponse> updateCrop(
            @PathVariable Long cropId,
            @Valid @RequestBody CropRequest request) {
        try {
            // Get farmer ID from JWT token
            Long farmerId = farmerService.getCurrentFarmerProfile().getId();
            CropResponse response = cropService.updateCrop(cropId, farmerId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @DeleteMapping("/{cropId}")
    public ResponseEntity<?> deleteCrop(@PathVariable Long cropId) {
        try {
            // Get farmer ID from JWT token
            Long farmerId = farmerService.getCurrentFarmerProfile().getId();
            cropService.deleteCrop(cropId, farmerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Return error message for better debugging
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new java.util.HashMap<String, String>() {{
                        put("error", e.getMessage() != null ? e.getMessage() : "Crop not found or access denied");
                    }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new java.util.HashMap<String, String>() {{
                        put("error", "Failed to delete crop: " + e.getMessage());
                    }});
        }
    }
}

