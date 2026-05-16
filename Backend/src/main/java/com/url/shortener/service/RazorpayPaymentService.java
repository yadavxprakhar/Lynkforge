package com.url.shortener.service;

import com.razorpay.RazorpayClient;
import com.razorpay.Subscription;
import com.url.shortener.dtos.CreateSubscriptionRequest;
import com.url.shortener.dtos.CreateSubscriptionResponse;
import com.url.shortener.models.SubscriptionTier;
import com.url.shortener.models.User;
import com.url.shortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private final UserRepository userRepository;

    @Value("${razorpay.keyId:}")
    private String keyId;
    @Value("${razorpay.keySecret:}")
    private String keySecret;
    @Value("${razorpay.webhookSecret:}")
    private String webhookSecret;

    @Value("${razorpay.planId.pro.monthly:}")
    private String proMonthlyPlanId;
    @Value("${razorpay.planId.business.monthly:}")
    private String businessMonthlyPlanId;

    public CreateSubscriptionResponse createSubscription(User user, CreateSubscriptionRequest req) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }

        if (!StringUtils.hasText(keyId) || !StringUtils.hasText(keySecret)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
            );
        }

        String plan = normalizePlan(req.getPlan());
        String interval = normalizeInterval(req.getInterval());
        String razorpayPlanId = resolvePlanId(plan, interval);

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject payload = new JSONObject();
            payload.put("plan_id", razorpayPlanId);
            payload.put("customer_notify", 1);
            payload.put("total_count", 120); // 10 years; can cancel anytime
            payload.put("notes", new JSONObject()
                    .put("userId", String.valueOf(user.getId()))
                    .put("username", String.valueOf(user.getUsername()))
                    .put("plan", plan)
                    .put("interval", interval));

            Subscription subscription = client.subscriptions.create(payload);

            String subscriptionId = subscription.get("id");
            if (StringUtils.hasText(subscriptionId)) {
                // Save early for easier reconciliation even before activation.
                User persisted = userRepository.findById(user.getId()).orElse(user);
                persisted.setRazorpaySubscriptionId(subscriptionId);
                persisted.setRazorpaySubscriptionStatus(subscription.get("status"));
                userRepository.save(persisted);
            }

            return new CreateSubscriptionResponse(keyId, subscriptionId, plan, interval);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not create Razorpay subscription: " + e.getMessage()
            );
        }
    }

    /** Verify signature and update user subscription tier based on webhook payload. */
    @Transactional
    public void handleWebhook(String rawBody, String signatureHeader) {
        if (!StringUtils.hasText(webhookSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Webhook secret not configured. Set RAZORPAY_WEBHOOK_SECRET."
            );
        }
        if (!StringUtils.hasText(signatureHeader)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing X-Razorpay-Signature header.");
        }
        if (!verifyWebhookSignature(rawBody, signatureHeader, webhookSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature.");
        }

        // Minimal parsing via org.json (already used by razorpay sdk)
        JSONObject event = new JSONObject(rawBody);
        String eventName = event.optString("event", "");

        JSONObject payload = event.optJSONObject("payload");
        if (payload == null) return;

        JSONObject subscriptionEntity = payload.optJSONObject("subscription");
        if (subscriptionEntity == null) return;
        JSONObject subscription = subscriptionEntity.optJSONObject("entity");
        if (subscription == null) return;

        String subscriptionId = subscription.optString("id", null);
        String status = subscription.optString("status", null);

        // Notes can carry our chosen plan key.
        JSONObject notes = subscription.optJSONObject("notes");
        String plan = notes != null ? notes.optString("plan", "") : "";

        if (!StringUtils.hasText(subscriptionId)) return;

        User user = userRepository.findByRazorpaySubscriptionId(subscriptionId).orElse(null);
        if (user == null) {
            // Fallback: try notes.userId if present
            if (notes != null && StringUtils.hasText(notes.optString("userId", ""))) {
                try {
                    long userId = Long.parseLong(notes.optString("userId"));
                    user = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException ignored) {
                    // ignore
                }
            }
        }
        if (user == null) return;

        user.setRazorpaySubscriptionId(subscriptionId);
        user.setRazorpaySubscriptionStatus(status);

        if ("subscription.activated".equals(eventName) || "subscription.charged".equals(eventName)) {
            if ("pro".equalsIgnoreCase(plan)) user.setSubscriptionTier(SubscriptionTier.PRO);
            else if ("business".equalsIgnoreCase(plan)) user.setSubscriptionTier(SubscriptionTier.BUSINESS);
        }

        if ("subscription.cancelled".equals(eventName) || "subscription.completed".equals(eventName)) {
            user.setSubscriptionTier(SubscriptionTier.STARTER);
        }

        userRepository.save(user);
    }

    private String normalizePlan(String plan) {
        if (!StringUtils.hasText(plan)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "plan is required (pro|business).");
        }
        String p = plan.trim().toLowerCase();
        if (!("pro".equals(p) || "business".equals(p))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "plan must be pro or business.");
        }
        return p;
    }

    private String normalizeInterval(String interval) {
        String i = StringUtils.hasText(interval) ? interval.trim().toLowerCase() : "monthly";
        if (!("monthly".equals(i))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only monthly is supported in local dev for now.");
        }
        return i;
    }

    private String resolvePlanId(String plan, String interval) {
        String planId =
                "pro".equals(plan) ? proMonthlyPlanId : businessMonthlyPlanId;
        if (!StringUtils.hasText(planId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Missing Razorpay plan id for " + plan + " " + interval + ". Set env vars RAZORPAY_PLAN_ID_PRO_MONTHLY / RAZORPAY_PLAN_ID_BUSINESS_MONTHLY."
            );
        }
        return planId;
    }

    private static boolean verifyWebhookSignature(String payload, String signature, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            sha256Hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = bytesToHex(raw);
            return constantTimeEquals(expected, signature);
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int res = 0;
        for (int i = 0; i < a.length(); i++) {
            res |= a.charAt(i) ^ b.charAt(i);
        }
        return res == 0;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

