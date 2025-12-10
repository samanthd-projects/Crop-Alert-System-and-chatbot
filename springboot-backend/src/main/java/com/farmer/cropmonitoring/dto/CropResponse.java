package com.farmer.cropmonitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropResponse {
    private Long id;
    private Long farmerId;
    private String cropName;
    private String season;
    private Double minTemp;
    private Double maxTemp;
    private Double minRain;
    private Double maxRain;
    private Double minWind;
    private Double maxWind;
    private Boolean emailEnabled;
    private Boolean smsEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

