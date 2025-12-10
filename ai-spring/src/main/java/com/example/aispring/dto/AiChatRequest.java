package com.example.aispring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {
    @NotBlank
    private String language;
    private String message;
}

