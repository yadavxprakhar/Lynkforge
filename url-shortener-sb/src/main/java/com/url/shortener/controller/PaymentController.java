package com.url.shortener.controller;

import com.url.shortener.dtos.CreateSubscriptionRequest;
import com.url.shortener.dtos.CreateSubscriptionResponse;
import com.url.shortener.models.User;
import com.url.shortener.service.RazorpayPaymentService;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/payments/razorpay")
@AllArgsConstructor
public class PaymentController {

    private final RazorpayPaymentService razorpayPaymentService;
    private final UserService userService;

    @PostMapping("/subscription")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CreateSubscriptionResponse> createSubscription(
            @RequestBody CreateSubscriptionRequest request,
            Principal principal
    ) {
        User user = userService.findByUsername(principal.getName());
        return ResponseEntity.ok(razorpayPaymentService.createSubscription(user, request));
    }

    /**
     * Webhook endpoint used by Razorpay (must be publicly reachable; for local dev use ngrok).
     * Signature header: X-Razorpay-Signature
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature
    ) {
        razorpayPaymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok().build();
    }
}

