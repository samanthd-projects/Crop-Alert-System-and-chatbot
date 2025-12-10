package com.farmer.cropmonitoring.repository;

import com.farmer.cropmonitoring.entity.AlertEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {
    List<AlertEvent> findByFarmerIdOrderByEventTimeDesc(Long farmerId);
    List<AlertEvent> findByFarmerIdAndEventTimeAfterOrderByEventTimeDesc(Long farmerId, LocalDateTime after);
    List<AlertEvent> findByCropIdOrderByEventTimeDesc(Long cropId);

    boolean existsByCropIdAndAlertType(Long cropId, String alertType);
    
    // Delete all alert events for a specific crop
    void deleteByCropId(Long cropId);
}

