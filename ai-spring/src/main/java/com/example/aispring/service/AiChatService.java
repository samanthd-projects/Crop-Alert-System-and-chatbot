package com.example.aispring.service;

import com.example.aispring.dto.AiChatRequest;
import com.example.aispring.dto.FarmerProfile;
import com.example.aispring.entity.AiChatRecord;
import com.example.aispring.repository.AiChatRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    private final WebClient.Builder webClientBuilder;
    private final AiChatRecordRepository aiChatRecordRepository;

    @Value("${spring.ai.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    // Gemini API key – hardcoded (exactly matching your working curl)
    // Your curl key: AIzaSyCxAiM-nrnLaPrPdtW7EEkZAf89UgR63vw
    private static final String GEMINI_API_KEY = "AIzaSyCdsf4YITumx4LZrCnEwUS6FcqscFJsFPo";

    // Base URL for Gemini 2.5 Flash – we pass the key in the header, not as a query param
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
    private String geminiApiUrl;
    private static final String AGRI_PROMPT = "You are an agriculture-only assistant. "
            + "Respond with a single short paragraph (max ~3 sentences). "
            + "Decline anything not clearly agriculture, farming, crop, soil, weather-for-farming, irrigation, pest, fertilizer, livestock, or agri-tech.";
    private static final String NON_AGRI_RESPONSE = "Please ask an agriculture-related question.";
    private static final int MAX_MESSAGES_PER_USER = 5;
    private static final String MESSAGE_LIMIT_REACHED = "You have reached the maximum limit of 5 messages. Please contact support for assistance.";

    // Helper method to check API key status (for debugging)
    public Map<String, String> getGeminiApiKeyStatus() {
        Map<String, String> status = new java.util.HashMap<>();
        status.put("hardcodedKey", GEMINI_API_KEY != null && !GEMINI_API_KEY.isBlank() ? 
                GEMINI_API_KEY.substring(0, Math.min(10, GEMINI_API_KEY.length())) + "..." : "null/empty");
        status.put("fromSystemProperty", System.getProperty("GEMINI_API_KEY") != null ? "present" : "null");
        status.put("fromEnvVar", System.getenv("GEMINI_API_KEY") != null ? "present" : "null");
        return status;
    }

    public String handleChat(AiChatRequest request, String authHeader) {
        // 1) Build the user message safely
        String userMessage = request.getMessage() != null ? request.getMessage().trim() : "";

        // 2) Decide what to send to Gemini
        String reply;
        if (!isAgricultureQuestion(userMessage)) {
            // Non-agriculture queries get a fixed response
            reply = NON_AGRI_RESPONSE;
        } else {
            // Call Gemini to generate the farming answer
            reply = generateGeminiReply(userMessage);
        }

        // 3) Try to get user profile and save full chat record to MongoDB (optional)
        try {
            FarmerProfile profile = fetchProfile(authHeader);

            if (profile != null && profile.getId() != null) {
                try {
                    AiChatRecord record = new AiChatRecord();
                    record.setUserId(profile.getId());
                    record.setUserName(profile.getName() != null ? profile.getName() : "Unknown");
                    record.setLanguage(request.getLanguage() != null ? request.getLanguage() : "en");
                    record.setRequestMessage(userMessage);
                    record.setResponse(reply);
                    aiChatRecordRepository.save(record);
                    log.info("Chat record saved successfully for user: {}", profile.getId());
                } catch (Exception e) {
                    log.warn("Failed to save chat record to MongoDB (continuing anyway): {}", e.getMessage());
                }
            } else {
                log.warn("Profile is null or missing ID, skipping MongoDB save");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch profile or save to MongoDB (continuing anyway): {}", e.getMessage());
        }

        // 4) Always return the AI reply to the caller
        return reply;
    }

    private FarmerProfile fetchProfile(String authHeader) {
        try {
            log.info("Attempting to fetch profile from backend: {}", backendBaseUrl);
            WebClient client = webClientBuilder.baseUrl(backendBaseUrl).build();
            
            FarmerProfile profile = client.get()
                    .uri("/farmer/profile")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), 
                            response -> {
                                log.warn("Backend returned error status: {}", response.statusCode());
                                return Mono.empty(); // Return empty instead of error
                            })
                    .bodyToMono(FarmerProfile.class)
                    .onErrorResume(ex -> {
                        log.warn("Error fetching profile (will continue without it): {}", ex.getMessage());
                        return Mono.empty(); // Return empty instead of error
                    })
                    .block();
            
            if (profile != null && profile.getId() != null) {
                log.info("Successfully fetched profile for user ID: {}", profile.getId());
                return profile;
            } else {
                log.warn("Profile is null or missing ID");
                return null;
            }
        } catch (Exception e) {
            log.warn("Exception fetching profile (will continue without it): {}", e.getMessage());
            return null; // Return null instead of throwing exception
        }
    }

    private boolean isAgricultureQuestion(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String lower = message.toLowerCase();
        return lower.contains("farm") || lower.contains("crop") || lower.contains("soil") || lower.contains("agri")
                || lower.contains("irrigation") || lower.contains("pest") || lower.contains("fertilizer")
                || lower.contains("livestock") || lower.contains("harvest") || lower.contains("weather")
                || lower.contains("yield") || lower.contains("plant") || lower.contains("seed");
    }

    private String generateGeminiReply(String userMessage) {
        // Using hardcoded API key (exactly matching your working curl)
        String apiKey = GEMINI_API_KEY;
        
        WebClient client = webClientBuilder.build();
        String prompt = AGRI_PROMPT + " User question: " + userMessage;
        
        // Build payload exactly matching your curl format
        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            String raw = client.post()
                    .uri(geminiApiUrl)
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (raw == null || raw.isBlank()) {
                return "Sorry, I couldn't generate a response right now.";
            }
            
            String text = extractText(raw);
            if (text == null || text.isBlank()) {
                // Try alternative parsing if standard path fails
                text = extractTextAlternative(raw);
                if (text == null || text.isBlank()) {
                    return "Sorry, I couldn't generate a response right now.";
                }
            }
            
            text = text.replace("\n", " ").trim();
            return text.length() > 600 ? text.substring(0, 600) : text;
        } catch (WebClientResponseException wcre) {
            // Return a more helpful error message
            String errorMsg = "API Error: " + wcre.getStatusCode();
            try {
                String errorBody = wcre.getResponseBodyAsString();
                if (errorBody != null && !errorBody.isBlank()) {
                    // Try to extract error message from JSON
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode errorJson = mapper.readTree(errorBody);
                        if (errorJson.has("error")) {
                            JsonNode error = errorJson.get("error");
                            if (error.has("message")) {
                                errorMsg = error.get("message").asText();
                            }
                        }
                    } catch (Exception e) {
                        // Use raw error body if JSON parsing fails
                        errorMsg = errorBody.length() > 200 ? errorBody.substring(0, 200) : errorBody;
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
            return "Sorry, I couldn't generate a response right now. " + errorMsg;
        } catch (Exception ex) {
            return "Sorry, I couldn't generate a response right now. Error: " + ex.getMessage();
        }
    }
    
    private String extractTextAlternative(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(raw);
            
            // Try different possible response structures
            if (root.has("candidates") && root.get("candidates").isArray() && root.get("candidates").size() > 0) {
                JsonNode candidate = root.get("candidates").get(0);
                if (candidate.has("content")) {
                    JsonNode content = candidate.get("content");
                    if (content.has("parts") && content.get("parts").isArray() && content.get("parts").size() > 0) {
                        JsonNode part = content.get("parts").get(0);
                        if (part.has("text")) {
                            return part.get("text").asText();
                        }
                    }
                }
            }
            
            // Try direct text field
            if (root.has("text")) {
                return root.get("text").asText();
            }
            
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    private String extractText(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(raw);
            return root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText(null);
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response", ex);
            return null;
        }
    }
}

