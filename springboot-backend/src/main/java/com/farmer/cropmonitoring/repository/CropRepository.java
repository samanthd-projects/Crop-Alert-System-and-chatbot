package com.farmer.cropmonitoring.repository;

import com.farmer.cropmonitoring.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByFarmerId(Long farmerId);
    void deleteByFarmerIdAndId(Long farmerId, Long cropId);
}

