package com.farmer.cropmonitoring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CropRequest {
    @NotBlank(message = "Crop name is required")
    private String cropName;
    
    @NotBlank(message = "Season is required")
    private String season; // Kharif, Rabi, Zaid
    
    private Double minTemp;
    private Double maxTemp;
    private Double minRain;
    private Double maxRain;
    private Double minWind;
    private Double maxWind;
    
    private Boolean emailEnabled = true;
}

