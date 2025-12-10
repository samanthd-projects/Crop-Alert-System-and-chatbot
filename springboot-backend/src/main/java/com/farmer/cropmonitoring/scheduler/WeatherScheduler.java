package com.farmer.cropmonitoring.scheduler;

import com.farmer.cropmonitoring.dto.WeatherResponse;
import com.farmer.cropmonitoring.entity.Farmer;
import com.farmer.cropmonitoring.repository.FarmerRepository;
import com.farmer.cropmonitoring.service.RuleEngineService;
import com.farmer.cropmonitoring.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeatherScheduler {
    private final WeatherService weatherService;
    private final RuleEngineService ruleEngineService;
    private final FarmerRepository farmerRepository;
    
    // Run every hour to check weather and generate alerts
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void checkWeatherAndGenerateAlerts() {
        log.info("Running scheduled weather check and alert generation");
        
        try {
            // Get all unique farmer locations
            List<Farmer> farmers = farmerRepository.findAll();
            for (Farmer farmer : farmers) {
                try {
                    String location = farmer.getLocation();
                    if (location != null && !location.isEmpty()) {
                        WeatherResponse weather = weatherService.fetchCurrentWeather(location);
                        ruleEngineService.checkWeatherRules(location, weather);
                        log.info("Checked weather for location: {}", location);
                    }
                } catch (Exception e) {
                    log.error("Error checking weather for farmer: {}", farmer.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error in scheduled weather check", e);
        }
    }
}

