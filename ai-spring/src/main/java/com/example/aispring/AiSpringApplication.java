package com.example.aispring;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AiSpringApplication {

    public static void main(String[] args) {
        // Load variables from .env file before Spring starts
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // Don't fail if .env is not present
                .load();

        // Set environment variables as system properties so Spring can read them
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(AiSpringApplication.class, args);
    }
}

