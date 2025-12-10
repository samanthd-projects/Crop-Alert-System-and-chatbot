package com.farmer.cropmonitoring.service;

import com.farmer.cropmonitoring.dto.CropRequest;
import com.farmer.cropmonitoring.dto.CropResponse;
import com.farmer.cropmonitoring.entity.AlertEvent;
import com.farmer.cropmonitoring.entity.Crop;
import com.farmer.cropmonitoring.repository.AlertEventRepository;
import com.farmer.cropmonitoring.repository.CropRepository;
import com.farmer.cropmonitoring.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CropService {
    private final CropRepository cropRepository;
    private final AlertEventRepository alertEventRepository;
    private final NotificationLogRepository notificationLogRepository;
    
    public CropResponse addCrop(Long farmerId, CropRequest request) {
        Crop crop = new Crop();
        crop.setFarmerId(farmerId);
        crop.setCropName(request.getCropName());
        crop.setSeason(request.getSeason());
        crop.setMinTemp(request.getMinTemp());
        crop.setMaxTemp(request.getMaxTemp());
        crop.setMinRain(request.getMinRain());
        crop.setMaxRain(request.getMaxRain());
        crop.setMinWind(request.getMinWind());
        crop.setMaxWind(request.getMaxWind());
        crop.setEmailEnabled(request.getEmailEnabled() != null ? request.getEmailEnabled() : true);
        
        Crop savedCrop = cropRepository.save(crop);
        return mapToResponse(savedCrop);
    }
    
    public List<CropResponse> getCropsByFarmerId(Long farmerId) {
        List<Crop> crops = cropRepository.findByFarmerId(farmerId);
        return crops.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public CropResponse updateCrop(Long cropId, Long farmerId, CropRequest request) {
        Crop crop = cropRepository.findById(cropId)
            .orElseThrow(() -> new RuntimeException("Crop not found"));
        
        if (!crop.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Crop does not belong to this farmer");
        }
        
        crop.setCropName(request.getCropName());
        crop.setSeason(request.getSeason());
        crop.setMinTemp(request.getMinTemp());
        crop.setMaxTemp(request.getMaxTemp());
        crop.setMinRain(request.getMinRain());
        crop.setMaxRain(request.getMaxRain());
        crop.setMinWind(request.getMinWind());
        crop.setMaxWind(request.getMaxWind());
        crop.setEmailEnabled(request.getEmailEnabled() != null ? request.getEmailEnabled() : true);
        
        Crop updatedCrop = cropRepository.save(crop);
        return mapToResponse(updatedCrop);
    }
    
    @Transactional
    public void deleteCrop(Long cropId, Long farmerId) {
        Crop crop = cropRepository.findById(cropId)
            .orElseThrow(() -> new RuntimeException("Crop not found"));
        
        if (!crop.getFarmerId().equals(farmerId)) {
            throw new RuntimeException("Crop does not belong to this farmer");
        }
        
        // Step 1: Find all alert events for this crop
        List<AlertEvent> alertEvents = alertEventRepository.findByCropIdOrderByEventTimeDesc(cropId);
        log.info("Deleting crop {}: Found {} alert events to delete", cropId, alertEvents.size());
        
        // Step 2: Delete all notification logs for these alert events
        if (!alertEvents.isEmpty()) {
            List<Long> eventIds = alertEvents.stream()
                .map(AlertEvent::getId)
                .collect(Collectors.toList());
            
            // Delete all notification logs for events related to this crop in one batch
            notificationLogRepository.deleteByEventIds(eventIds);
            log.info("Deleted notification logs for {} events", eventIds.size());
        }
        
        // Step 3: Delete all alert events for this crop
        alertEventRepository.deleteByCropId(cropId);
        log.info("Deleted all alert events for crop {}", cropId);
        
        // Step 4: Finally delete the crop itself
        cropRepository.delete(crop);
        log.info("Successfully deleted crop {} and all related data", cropId);
    }
    
    public CropResponse getCropById(Long cropId) {
        Crop crop = cropRepository.findById(cropId)
            .orElseThrow(() -> new RuntimeException("Crop not found"));
        return mapToResponse(crop);
    }
    
    private CropResponse mapToResponse(Crop crop) {
        return new CropResponse(
            crop.getId(),
            crop.getFarmerId(),
            crop.getCropName(),
            crop.getSeason(),
            crop.getMinTemp(),
            crop.getMaxTemp(),
            crop.getMinRain(),
            crop.getMaxRain(),
            crop.getMinWind(),
            crop.getMaxWind(),
            crop.getEmailEnabled(),
            crop.getSmsEnabled(),
            crop.getCreatedAt(),
            crop.getUpdatedAt()
        );
    }
}

