package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateSubscriptionResponse {
    private String keyId;
    private String subscriptionId;
    private String plan;
    private String interval;
}

