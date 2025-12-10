package com.farmer.cropmonitoring.controller;

import com.farmer.cropmonitoring.dto.AlertEventResponse;
import com.farmer.cropmonitoring.entity.AlertEvent;
import com.farmer.cropmonitoring.repository.AlertEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertController {
    private final AlertEventRepository alertEventRepository;
    
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AlertEventResponse>> getAlertsByFarmer(@PathVariable Long farmerId) {
        List<AlertEvent> alerts = alertEventRepository.findByFarmerIdOrderByEventTimeDesc(farmerId);
        List<AlertEventResponse> responses = alerts.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/farmer/{farmerId}/recent")
    public ResponseEntity<List<AlertEventResponse>> getRecentAlerts(
            @PathVariable Long farmerId,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime after = LocalDateTime.now().minusDays(days);
        List<AlertEvent> alerts = alertEventRepository.findByFarmerIdAndEventTimeAfterOrderByEventTimeDesc(
            farmerId, after);
        List<AlertEventResponse> responses = alerts.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<AlertEventResponse>> getAlertsByCrop(@PathVariable Long cropId) {
        List<AlertEvent> alerts = alertEventRepository.findByCropIdOrderByEventTimeDesc(cropId);
        List<AlertEventResponse> responses = alerts.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private AlertEventResponse mapToResponse(AlertEvent alert) {
        return new AlertEventResponse(
            alert.getId(),
            alert.getFarmerId(),
            alert.getCropId(),
            alert.getCropName(),
            alert.getAlertType(),
            alert.getTemperature(),
            alert.getRainfall(),
            alert.getWind(),
            alert.getThresholdValue(),
            alert.getEventTime()
        );
    }
}

