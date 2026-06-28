package com.devops;

// ============================================================
// HomeController.java — REST API Endpoints
// Handles: GET / and GET /health
// ============================================================

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @Value("${app.version}")
    private String appVersion;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("message", "DevOps Spring App is running!");
        response.put("version", appVersion);
        response.put("environment", activeProfile);
        return response;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("environment", activeProfile);
        return response;
    }
}
