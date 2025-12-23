package com.example.aispring.controller;

import com.example.aispring.dto.AiChatRequest;
import com.example.aispring.dto.AiChatResponseDto;
import com.example.aispring.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AiChatController {

    private static final Logger log = LoggerFactory.getLogger(AiChatController.class);
    private final AiChatService aiChatService;

    @org.springframework.web.bind.annotation.GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "ai-spring"));
    }

    @org.springframework.web.bind.annotation.GetMapping("/test-gemini-key")
    public ResponseEntity<Map<String, Object>> testGeminiKey() {
        String keyFromConfig = System.getProperty("GEMINI_API_KEY");
        String keyFromEnv = System.getenv("GEMINI_API_KEY");
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("keyFromSystemProperty", keyFromConfig != null ? keyFromConfig.substring(0, Math.min(10, keyFromConfig.length())) + "..." : "null");
        response.put("keyFromEnvVar", keyFromEnv != null ? keyFromEnv.substring(0, Math.min(10, keyFromEnv.length())) + "..." : "null");
        response.put("keyFromService", aiChatService.getGeminiApiKeyStatus());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/respond")
    public ResponseEntity<AiChatResponseDto> respond(
            @Valid @RequestBody AiChatRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {

        if (authHeader == null || authHeader.isBlank()) {
            log.warn("Request received without authorization header");
            return ResponseEntity.status(401)
                    .body(new AiChatResponseDto("Authentication required. Please login first."));
        }

        try {
            log.info("Processing chat request for message: {}", request.getMessage());
            String reply = aiChatService.handleChat(request, authHeader);
            return ResponseEntity.ok(new AiChatResponseDto(reply));
        } catch (RuntimeException e) {
            log.error("Error processing chat request: {}", e.getMessage(), e);
            // Use the exception message if it's user-friendly, otherwise use generic message
            String errorMessage = e.getMessage();
            if (errorMessage != null && 
                (errorMessage.contains("Authentication failed") || 
                 errorMessage.contains("Cannot connect") ||
                 errorMessage.contains("Backend service"))) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AiChatResponseDto(errorMessage));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AiChatResponseDto("Sorry, I couldn't process your request right now. Please try again later."));
        } catch (Exception e) {
            log.error("Unexpected error processing chat request: {}", e.getMessage(), e);
            String errorMessage = "An unexpected error occurred. Please try again later.";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AiChatResponseDto(errorMessage));
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AiChatResponseDto> handleValidationException(MethodArgumentNotValidException e) {
        log.error("Validation error: {}", e.getMessage());
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Invalid request data");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AiChatResponseDto("Invalid request: " + errorMessage));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<AiChatResponseDto> handleException(Exception e) {
        log.error("Unhandled exception in controller: {}", e.getMessage(), e);
        String errorMessage = "An error occurred processing your request.";
        if (e.getMessage() != null && 
            (e.getMessage().contains("Authentication failed") || 
             e.getMessage().contains("Cannot connect") ||
             e.getMessage().contains("Backend service"))) {
            errorMessage = e.getMessage();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AiChatResponseDto(errorMessage));
    }
}

