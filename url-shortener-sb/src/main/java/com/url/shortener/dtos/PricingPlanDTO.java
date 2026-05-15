package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingPlanDTO {
    /** stable id: starter, pro, business */
    private String id;
    /** "free" or "paid" */
    private String kind;
    /** null when free */
    private Double monthlyUsd;
    private PlanLimitsDTO limits;
}
