package com.farmer.cropmonitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String error;
    private String message;
    
    public ErrorResponse(String error) {
        this.error = error;
        this.message = error;
    }
}

