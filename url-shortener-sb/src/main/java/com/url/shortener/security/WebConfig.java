package com.url.shortener.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig {

    @Value("${frontend.url}")
    private String frontEndUrl;

    /** Single CORS definition used by MVC + Spring Security (see WebSecurityConfig#cors). */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        String primary = frontEndUrl.replaceAll("/$", "");
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOriginPatterns(
                Arrays.asList(
                        primary,
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://*.localhost:*"));
        cors.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
