package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDTO {
    private String tier;
    private PlanLimitsDTO entitlements;
    private SubscriptionUsageDTO usage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionUsageDTO {
        private long activeLinks;
        private int qrGenerations;
    }
}
