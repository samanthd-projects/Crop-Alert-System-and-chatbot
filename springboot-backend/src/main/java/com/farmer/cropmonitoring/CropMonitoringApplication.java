package com.farmer.cropmonitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CropMonitoringApplication {
    public static void main(String[] args) {
        SpringApplication.run(CropMonitoringApplication.class, args);
    }
}

