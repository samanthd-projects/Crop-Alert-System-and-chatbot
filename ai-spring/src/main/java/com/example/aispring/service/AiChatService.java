package com.example.aispring.service;

import com.example.aispring.dto.AiChatRequest;
import com.example.aispring.dto.FarmerProfile;
import com.example.aispring.entity.AiChatRecord;
import com.example.aispring.repository.AiChatRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final WebClient.Builder webClientBuilder;
    private final AiChatRecordRepository aiChatRecordRepository;

    @Value("${spring.ai.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    public String handleChat(AiChatRequest request, String authHeader) {
        FarmerProfile profile = fetchProfile(authHeader);
        String prompt=buildPrompt();
        String reply = generateHi();




        AiChatRecord record = new AiChatRecord();
        record.setUserId(profile.getId());
        record.setUserName(profile.getName());
        record.setLanguage(request.getLanguage());
        record.setRequestMessage(request.getMessage());
        record.setResponse(reply);
        aiChatRecordRepository.save(record);

        return reply;
    }

    private FarmerProfile fetchProfile(String authHeader) {
        WebClient client = webClientBuilder.baseUrl(backendBaseUrl).build();
        return client.get()
                .uri("/farmer/profile")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .bodyToMono(FarmerProfile.class)
                .onErrorResume(ex -> Mono.error(new RuntimeException("Failed to fetch user profile", ex)))
                .block();
    }

    private String generateHi() {
        return "hi";
    }

    private String buildPrompt() {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please dont generate a subject line");
    
        return prompt.toString();
    }


}

