package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LinkAnalyticsDTO {
    private String shortUrl;
    private List<AnalyticsDailyDTO> series;
    private long totalClicks;
}

