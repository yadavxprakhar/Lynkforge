package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingCatalogDTO {
    /** Annual billing discount (e.g. 0.17 = 17% off vs 12× monthly). */
    private double annualDiscountRate;
    /** Display helper; billing still uses USD on backend. */
    private int inrPerUsd;
    private List<PricingPlanDTO> plans;
}
