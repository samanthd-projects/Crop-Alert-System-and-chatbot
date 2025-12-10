package com.farmer.cropmonitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLogResponse {
    private Long id;
    private Long eventId;
    private Long farmerId;
    private String farmerEmail;
    private Boolean emailSent; // Yes (true) or No (false)
    private LocalDateTime emailSentAt;
    private String message;
    private LocalDateTime sentAt;
}

