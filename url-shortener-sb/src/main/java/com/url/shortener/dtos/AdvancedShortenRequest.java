package com.url.shortener.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdvancedShortenRequest {
    private String originalUrl;

    /** Optional: custom alias for shortUrl */
    private String customAlias;

    /** Optional: protect redirect with password */
    private String password;

    /** Optional: expiry time (ISO local datetime) */
    private LocalDateTime expiresAt;

    /** If true, backend returns a base64 PNG QR in response */
    private boolean generateQrCode;
}

