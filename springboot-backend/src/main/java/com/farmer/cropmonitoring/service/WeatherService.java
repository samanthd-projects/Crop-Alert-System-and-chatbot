package com.farmer.cropmonitoring.service;

import com.farmer.cropmonitoring.dto.WeatherResponse;
import com.farmer.cropmonitoring.entity.WeatherReading;
import com.farmer.cropmonitoring.repository.WeatherReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private final WeatherReadingRepository weatherReadingRepository;
    private final WebClient.Builder webClientBuilder;
    
    @Value("${weather.api.base-url:http://localhost:8081}")
    private String weatherApiBaseUrl;
    
    public WeatherResponse fetchCurrentWeather(String location) {
        try {
            WebClient webClient = webClientBuilder.baseUrl(weatherApiBaseUrl).build();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/weather/current")
                    .queryParam("location", location != null ? location : "")
                    .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
            
            if (response != null && response.containsKey("current")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> current = (Map<String, Object>) response.get("current");
                
                WeatherResponse weatherResponse = new WeatherResponse();
                weatherResponse.setLocation(location);
                weatherResponse.setTemperature(((Number) current.get("temperature")).doubleValue());

                // Rainfall may be missing; support multiple possible keys and default to 0.0
                Object rainfallObj = current.get("rainfall");
                if (rainfallObj == null) {
                    rainfallObj = current.get("rain");
                }
                if (rainfallObj == null) {
                    rainfallObj = 0.0;
                }
                weatherResponse.setRainfall(((Number) rainfallObj).doubleValue());

                weatherResponse.setWindSpeed(((Number) current.get("windSpeed")).doubleValue());
                weatherResponse.setCondition((String) current.getOrDefault("condition", "unknown"));
                weatherResponse.setTimestamp(LocalDateTime.now().toString());
                
                // Save to database
                saveWeatherReading(location, weatherResponse);
                
                return weatherResponse;
            }
            
            throw new RuntimeException("Failed to fetch weather data");
        } catch (Exception e) {
            throw new RuntimeException("Error fetching weather: " + e.getMessage());
        }
    }
    
    private void saveWeatherReading(String location, WeatherResponse weather) {
        WeatherReading reading = new WeatherReading();
        reading.setLocation(location);
        reading.setTemp(weather.getTemperature());
        reading.setRain(weather.getRainfall());
        reading.setWind(weather.getWindSpeed());
        weatherReadingRepository.save(reading);
    }
}

