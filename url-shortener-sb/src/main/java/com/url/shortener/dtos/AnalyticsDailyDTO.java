package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AnalyticsDailyDTO {
    private LocalDate date;
    private long clicks;
}

