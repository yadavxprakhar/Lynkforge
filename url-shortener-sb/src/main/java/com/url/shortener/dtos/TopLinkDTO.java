package com.url.shortener.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopLinkDTO {
    private String shortUrl;
    private long clicks;
}

