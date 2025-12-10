package com.farmer.cropmonitoring.service;

import com.farmer.cropmonitoring.entity.AlertEvent;
import com.farmer.cropmonitoring.entity.Crop;
import com.farmer.cropmonitoring.entity.Farmer;
import com.farmer.cropmonitoring.entity.NotificationLog;
import com.farmer.cropmonitoring.repository.FarmerRepository;
import com.farmer.cropmonitoring.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final NotificationLogRepository notificationLogRepository;
    private final FarmerRepository farmerRepository;
    private final JavaMailSender mailSender;
    
    // Email cooldown: 24 hours (1 per day)
    private static final int EMAIL_COOLDOWN_HOURS = 24;
    
    public void sendNotifications(AlertEvent alertEvent, Crop crop) {
        Farmer farmer = farmerRepository.findById(alertEvent.getFarmerId())
            .orElse(null);
        
        if (farmer == null) {
            log.warn("Farmer not found for alert event: {}", alertEvent.getId());
            return;
        }
        
        String message = buildAlertMessage(alertEvent);
        NotificationLog notificationLog = new NotificationLog();
        notificationLog.setEventId(alertEvent.getId());
        notificationLog.setFarmerId(farmer.getId());
        notificationLog.setFarmerEmail(farmer.getEmail() != null ? farmer.getEmail() : "");
        notificationLog.setMessage(message);
        notificationLog.setEmailSent(false); // Default to No
        
        // Check if email should be sent:
        // 1. Crop email must be enabled (user hasn't deactivated it)
        // 2. Farmer must have an email address
        // 3. No email sent for this crop+alertType in last 2 hours
        boolean shouldSendEmail = crop.getEmailEnabled() != null && crop.getEmailEnabled() 
                && farmer.getEmail() != null && !farmer.getEmail().trim().isEmpty();
        
        if (shouldSendEmail) {
            // Check if email was sent in last 2 hours for this crop+alertType
            LocalDateTime twoHoursAgo = LocalDateTime.now().minusHours(EMAIL_COOLDOWN_HOURS);
            boolean emailSentRecently = notificationLogRepository.findRecentEmailSent(
                crop.getId(), 
                alertEvent.getAlertType(), 
                twoHoursAgo
            ).isPresent();
            
            if (!emailSentRecently) {
                try {
                    sendEmail(farmer.getEmail(), "Crop Alert: " + alertEvent.getCropName(), message);
                    notificationLog.setEmailSent(true); // Yes - email sent
                    notificationLog.setEmailSentAt(LocalDateTime.now());
                    log.info("Email sent successfully to {} for crop {} - alert type: {}", 
                        farmer.getEmail(), alertEvent.getCropName(), alertEvent.getAlertType());
                } catch (Exception e) {
                    log.error("Failed to send email to {}", farmer.getEmail(), e);
                    notificationLog.setEmailSent(false); // No - email failed
                }
            } else {
                notificationLog.setEmailSent(false); // No - skipped due to cooldown
                log.info("Skipping email for crop {} - alert type: {} (email sent within last {} hours)", 
                    alertEvent.getCropName(), alertEvent.getAlertType(), EMAIL_COOLDOWN_HOURS);
            }
        } else {
            notificationLog.setEmailSent(false); // No - disabled or no email
            if (crop.getEmailEnabled() == null || !crop.getEmailEnabled()) {
                log.info("Email disabled for crop {} - user has deactivated email alerts", alertEvent.getCropName());
            } else if (farmer.getEmail() == null || farmer.getEmail().trim().isEmpty()) {
                log.warn("Email not sent for crop {} - farmer {} has no email address", 
                    alertEvent.getCropName(), farmer.getId());
            }
        }
        
        notificationLogRepository.save(notificationLog);
    }
    
    private void sendEmail(String to, String subject, String body) {
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("samanthsamanth2@gmail.com");
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Email sent successfully from samanthsamanth2@gmail.com to: {}", to);
            } else {
                log.warn("JavaMailSender not configured. Email would be sent to: {} with subject: {}", to, subject);
            }
        } catch (Exception e) {
            log.error("Error sending email to: {}", to, e);
            throw e;
        }
    }
    
    private String buildAlertMessage(AlertEvent alertEvent) {
        return String.format(
            "Alert for %s: %s\n" +
            "Current Temperature: %.2f°C\n" +
            "Current Rainfall: %.2f mm\n" +
            "Current Wind Speed: %.2f km/h\n" +
            "Threshold: %.2f\n" +
            "Time: %s",
            alertEvent.getCropName(),
            alertEvent.getAlertType(),
            alertEvent.getTemperature(),
            alertEvent.getRainfall(),
            alertEvent.getWind(),
            alertEvent.getThresholdValue(),
            alertEvent.getEventTime()
        );
    }
}

