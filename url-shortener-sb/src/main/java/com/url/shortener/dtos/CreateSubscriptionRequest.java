package com.url.shortener.dtos;

import lombok.Data;

@Data
public class CreateSubscriptionRequest {
    /** "pro" | "business" */
    private String plan;
    /** "monthly" (annual can be added later) */
    private String interval;
}

