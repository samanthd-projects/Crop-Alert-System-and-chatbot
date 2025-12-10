package com.example.aispring.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "ai-response")
public class AiChatRecord {
    @Id
    private String id;
    private Long userId;
    private String userName;
    private String language;
    private String requestMessage;
    private String response;
    private Instant createdAt = Instant.now();
}

