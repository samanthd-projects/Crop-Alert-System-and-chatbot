package com.farmer.cropmonitoring.controller;

import com.farmer.cropmonitoring.dto.NotificationLogResponse;
import com.farmer.cropmonitoring.entity.NotificationLog;
import com.farmer.cropmonitoring.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationLogRepository notificationLogRepository;
    
    @GetMapping
    public ResponseEntity<List<NotificationLogResponse>> getAllNotifications() {
        List<NotificationLog> logs = notificationLogRepository.findAllByOrderByEmailSentAtDesc();
        List<NotificationLogResponse> responses = logs.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<NotificationLogResponse>> getNotificationsByEvent(@PathVariable Long eventId) {
        List<NotificationLog> logs = notificationLogRepository.findByEventId(eventId);
        List<NotificationLogResponse> responses = logs.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    private NotificationLogResponse mapToResponse(NotificationLog log) {
        return new NotificationLogResponse(
            log.getId(),
            log.getEventId(),
            log.getFarmerId(),
            log.getFarmerEmail(),
            log.getEmailSent(),
            log.getEmailSentAt(),
            log.getMessage(),
            log.getSentAt()
        );
    }
}

