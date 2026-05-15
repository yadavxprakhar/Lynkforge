package com.url.shortener.controller;

import com.url.shortener.dtos.UserSubscriptionDTO;
import com.url.shortener.models.User;
import com.url.shortener.service.SubscriptionService;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/subscription")
@AllArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserSubscriptionDTO> me(Principal principal) {
        User user = userService.findByUsername(principal.getName());
        return ResponseEntity.ok(subscriptionService.getStatus(user));
    }
}
