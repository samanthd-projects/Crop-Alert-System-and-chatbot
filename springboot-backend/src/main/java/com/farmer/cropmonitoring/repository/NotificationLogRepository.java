package com.farmer.cropmonitoring.repository;

import com.farmer.cropmonitoring.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByEventId(Long eventId);
    List<NotificationLog> findAllByOrderByEmailSentAtDesc();
    
    // Delete all notification logs for a specific event
    void deleteByEventId(Long eventId);
    
    // Delete all notification logs for multiple events (used when deleting crop)
    @Modifying
    @Transactional
    @Query("DELETE FROM NotificationLog n WHERE n.eventId IN :eventIds")
    void deleteByEventIds(@Param("eventIds") List<Long> eventIds);
    
    // Check if email was sent for a crop+alertType in the last 24 hours
    // Join NotificationLog with AlertEvent through eventId
    @Query("SELECT n FROM NotificationLog n " +
           "INNER JOIN AlertEvent a ON n.eventId = a.id " +
           "WHERE a.cropId = :cropId " +
           "AND a.alertType = :alertType " +
           "AND n.emailSent = true " +
           "AND n.emailSentAt >= :twoHoursAgo " +
           "ORDER BY n.emailSentAt DESC")
    Optional<NotificationLog> findRecentEmailSent(
        @Param("cropId") Long cropId,
        @Param("alertType") String alertType,
        @Param("twoHoursAgo") LocalDateTime twoHoursAgo
    );
}

