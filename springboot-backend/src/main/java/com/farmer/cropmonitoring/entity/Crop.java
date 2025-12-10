package com.farmer.cropmonitoring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "crops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Crop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;
    
    @Column(name = "crop_name", nullable = false)
    private String cropName;
    
    @Column(nullable = false)
    private String season; // Kharif, Rabi, Zaid
    
    // Temperature thresholds
    @Column(name = "min_temp")
    private Double minTemp;
    
    @Column(name = "max_temp")
    private Double maxTemp;
    
    // Rainfall thresholds
    @Column(name = "min_rain")
    private Double minRain;
    
    @Column(name = "max_rain")
    private Double maxRain;
    
    // Wind thresholds
    @Column(name = "min_wind")
    private Double minWind;
    
    @Column(name = "max_wind")
    private Double maxWind;
    
    // Alert preferences
    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled = true;

    // SMS alert preference (mapped to existing DB column)
    @Column(name = "sms_enabled", nullable = false)
    private Boolean smsEnabled = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

