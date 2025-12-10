package com.farmer.cropmonitoring.repository;

import com.farmer.cropmonitoring.entity.WeatherReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherReadingRepository extends JpaRepository<WeatherReading, Long> {
    List<WeatherReading> findByLocationOrderByRecordedAtDesc(String location);
    List<WeatherReading> findByLocationAndRecordedAtBetween(String location, LocalDateTime start, LocalDateTime end);
}

