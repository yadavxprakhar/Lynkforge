package com.url.shortener.controller;

import com.url.shortener.models.UrlMapping;
import com.url.shortener.service.UrlMappingService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@RestController
@AllArgsConstructor
public class RedirectController {

    private UrlMappingService urlMappingService;

    @GetMapping("/{shortUrl}")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortUrl,
            @RequestParam(value = "p", required = false) String password,
            HttpServletRequest request
    ){
        String referrer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        UrlMapping urlMapping = urlMappingService.getOriginalUrl(shortUrl, referrer, userAgent);
        if (urlMapping != null) {
            if (urlMapping.getExpiresAt() != null && urlMapping.getExpiresAt().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(410).build();
            }
            if (urlMapping.getPasswordHash() != null && !urlMappingService.verifyPassword(urlMapping, password)) {
                return ResponseEntity.status(401).build();
            }
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("Location", urlMapping.getOriginalUrl());
            return ResponseEntity.status(302).headers(httpHeaders).build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
