package com.url.shortener.controller;

import com.url.shortener.dtos.PricingCatalogDTO;
import com.url.shortener.service.SubscriptionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/pricing")
@AllArgsConstructor
public class PricingController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/catalog")
    public ResponseEntity<PricingCatalogDTO> catalog() {
        return ResponseEntity.ok(subscriptionService.getPublicCatalog());
    }
}
