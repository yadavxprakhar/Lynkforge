package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanLimitsDTO {
    private int maxLinks;
    private int maxQrCodes;
    private int maxCustomDomains;
    private int maxCampaigns;
    private boolean advancedAnalytics;
    private boolean adRemoval;
    private boolean prioritySupport;
}
