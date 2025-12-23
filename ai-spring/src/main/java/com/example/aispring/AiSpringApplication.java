package com.example.aispring;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiSpringApplication {

    public static void main(String[] args) {
        // Load variables from .env (if present) before Spring starts
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // don't fail if .env is not there
                .load();

        String geminiKey = dotenv.get("GEMINI_API_KEY");
        if (geminiKey != null && !geminiKey.isBlank()) {
            // Expose as system property so Spring property placeholders can read it
            System.setProperty("GEMINI_API_KEY", geminiKey);
        }

        SpringApplication.run(AiSpringApplication.class, args);
    }
}

