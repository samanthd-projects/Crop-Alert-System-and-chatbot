package com.farmer.cropmonitoring.service;

import com.farmer.cropmonitoring.dto.WeatherResponse;
import com.farmer.cropmonitoring.entity.AlertEvent;
import com.farmer.cropmonitoring.entity.Crop;
import com.farmer.cropmonitoring.repository.AlertEventRepository;
import com.farmer.cropmonitoring.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleEngineService {
    private final CropRepository cropRepository;
    private final AlertEventRepository alertEventRepository;
    private final NotificationService notificationService;
    
    public List<AlertEvent> checkWeatherRules(String location, WeatherResponse weather) {
        List<Crop> crops = cropRepository.findAll();
        List<AlertEvent> alertEvents = new ArrayList<>();
        
        for (Crop crop : crops) {
            // Only check crops for farmers in the same location
            // For now, check all crops (you can add location matching later)
            
            List<String> alerts = new ArrayList<>();
            Double thresholdValue = null;
            
            // Check temperature thresholds
            if (crop.getMaxTemp() != null && weather.getTemperature() > crop.getMaxTemp()) {
                alerts.add("High Temperature");
                thresholdValue = crop.getMaxTemp();
            }
            if (crop.getMinTemp() != null && weather.getTemperature() < crop.getMinTemp()) {
                alerts.add("Low Temperature");
                thresholdValue = crop.getMinTemp();
            }
            
            // Check rainfall thresholds
            if (crop.getMaxRain() != null && weather.getRainfall() > crop.getMaxRain()) {
                alerts.add("Heavy Rainfall");
                thresholdValue = crop.getMaxRain();
            }
            if (crop.getMinRain() != null && weather.getRainfall() < crop.getMinRain()) {
                alerts.add("Low Rainfall");
                thresholdValue = crop.getMinRain();
            }
            
            // Check wind thresholds
            if (crop.getMaxWind() != null && weather.getWindSpeed() > crop.getMaxWind()) {
                alerts.add("High Wind Speed");
                thresholdValue = crop.getMaxWind();
            }
            if (crop.getMinWind() != null && weather.getWindSpeed() < crop.getMinWind()) {
                alerts.add("Low Wind Speed");
                thresholdValue = crop.getMinWind();
            }
            
            // Create alert events for each alert, but only once per crop+alertType
            for (String alertType : alerts) {
                // If an alert of this type for this crop already exists, skip creating another
                if (alertEventRepository.existsByCropIdAndAlertType(crop.getId(), alertType)) {
                    continue;
                }

                AlertEvent alertEvent = new AlertEvent();
                alertEvent.setFarmerId(crop.getFarmerId());
                alertEvent.setCropId(crop.getId());
                alertEvent.setCropName(crop.getCropName());
                alertEvent.setAlertType(alertType);
                alertEvent.setTemperature(weather.getTemperature());
                alertEvent.setRainfall(weather.getRainfall());
                alertEvent.setWind(weather.getWindSpeed());
                alertEvent.setThresholdValue(thresholdValue);
                
                AlertEvent savedEvent = alertEventRepository.save(alertEvent);
                alertEvents.add(savedEvent);
                
                // Send notifications (Kafka would be used here, but leaving empty for now)
                // For now, directly call notification service
                try {
                    notificationService.sendNotifications(savedEvent, crop);
                } catch (Exception e) {
                    log.error("Error sending notifications for alert event: {}", savedEvent.getId(), e);
                }
            }
        }
        
        return alertEvents;
    }
}

