package com.farmer.cropmonitoring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;
    
    @Column(name = "crop_id", nullable = false)
    private Long cropId;
    
    @Column(name = "crop_name", nullable = false)
    private String cropName;
    
    @Column(name = "alert_type", nullable = false)
    private String alertType; // High Temperature, Low Temperature, Heavy Rainfall, etc.
    
    @Column(nullable = false)
    private Double temperature;
    
    @Column(nullable = false)
    private Double rainfall;
    
    @Column(nullable = false)
    private Double wind;
    
    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;
    
    @Column(name = "event_time")
    private LocalDateTime eventTime;
    
    @PrePersist
    protected void onCreate() {
        eventTime = LocalDateTime.now();
    }
}

