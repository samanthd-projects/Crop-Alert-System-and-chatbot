package com.example.aispring.repository;

import com.example.aispring.entity.AiChatRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AiChatRecordRepository extends MongoRepository<AiChatRecord, String> {
}

