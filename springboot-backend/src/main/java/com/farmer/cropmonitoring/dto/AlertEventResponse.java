package com.farmer.cropmonitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertEventResponse {
    private Long id;
    private Long farmerId;
    private Long cropId;
    private String cropName;
    private String alertType;
    private Double temperature;
    private Double rainfall;
    private Double wind;
    private Double thresholdValue;
    private LocalDateTime eventTime;
}

