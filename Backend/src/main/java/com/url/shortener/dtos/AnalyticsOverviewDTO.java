package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AnalyticsOverviewDTO {
    private List<AnalyticsDailyDTO> series;

    private long totalClicks;
    private long clicksToday;
    private long activeLinks;
    private TopLinkDTO topLink;

    private Long previousTotalClicks;
    private Double percentChange;
}

