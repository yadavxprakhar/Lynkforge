package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AnalyticsBreakdownDTO {
    private List<KeyCountDTO> topReferrers;
    private List<KeyCountDTO> devices;
}

