package com.farmer.cropmonitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherResponse {
    private String location;
    private Double temperature;
    private Double rainfall;
    private Double windSpeed;
    private String condition;
    private String timestamp;
}

