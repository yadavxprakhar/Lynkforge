package com.url.shortener.controller;

import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.AdvancedShortenRequest;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.User;
import com.url.shortener.service.QrCodeService;
import com.url.shortener.service.SubscriptionService;
import com.url.shortener.service.UrlMappingService;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@AllArgsConstructor
public class UrlMappingController {
    private UrlMappingService urlMappingService;
    private UserService userService;
    private QrCodeService qrCodeService;
    private SubscriptionService subscriptionService;

    private static final String ANON_SHORTEN_COOKIE = "lx_anon_shorten_used";

    // {"originalUrl":"https://example.com"}
//    https://abc.com/QN7XOa0a --> https://example.com

    @PostMapping("/shorten")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UrlMappingDTO> createShortUrl(@RequestBody Map<String, String> request,
                                                        Principal principal){
        String originalUrl = request.get("originalUrl");
        User user = userService.findByUsername(principal.getName());
        UrlMappingDTO urlMappingDTO = urlMappingService.createShortUrl(originalUrl, user);
        return ResponseEntity.ok(urlMappingDTO);
    }

    @PostMapping("/shorten/advanced")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createShortUrlAdvanced(
            @RequestBody AdvancedShortenRequest request,
            Principal principal
    ) {
        if (request.getOriginalUrl() == null || request.getOriginalUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "originalUrl is required"));
        }

        String alias = request.getCustomAlias();
        if (alias != null && !alias.trim().isEmpty()) {
            String trimmed = alias.trim();
            if (!trimmed.matches("^[A-Za-z0-9_-]{3,32}$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "customAlias must be 3-32 chars: letters, numbers, _ or -"));
            }
        }

        User user = userService.findByUsername(principal.getName());

        if (request.isGenerateQrCode()) {
            subscriptionService.assertCanGenerateQr(user);
        }

        UrlMappingDTO dto;
        try {
            dto = urlMappingService.createShortUrlAdvanced(
                    request.getOriginalUrl().trim(),
                    request.getCustomAlias(),
                    request.getPassword(),
                    request.getExpiresAt(),
                    user
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        if (!request.isGenerateQrCode()) {
            return ResponseEntity.ok(dto);
        }

        subscriptionService.recordQrGeneration(user);

        String shortLink = "/" + dto.getShortUrl();
        byte[] png = qrCodeService.generatePng(shortLink, 360);
        String base64 = java.util.Base64.getEncoder().encodeToString(png);
        return ResponseEntity.ok(Map.of(
                "url", dto,
                "qrCodePngBase64", base64
        ));
    }

    /**
     * Allows one (1) anonymous shorten per browser via HttpOnly cookie.
     * After it's used, user must log in to shorten more.
     */
    @PostMapping("/public/shorten-once")
    public ResponseEntity<?> createShortUrlOnceAnonymous(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String originalUrl = request.get("originalUrl");
        if (originalUrl == null || originalUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "originalUrl is required"));
        }

        boolean used = false;
        if (httpRequest.getCookies() != null) {
            for (var cookie : httpRequest.getCookies()) {
                if (ANON_SHORTEN_COOKIE.equals(cookie.getName()) && "1".equals(cookie.getValue())) {
                    used = true;
                    break;
                }
            }
        }

        if (used) {
            return ResponseEntity.status(401).body(Map.of("message", "Login required to shorten more links"));
        }

        UrlMappingDTO urlMappingDTO = urlMappingService.createShortUrl(originalUrl.trim(), null);

        ResponseCookie cookie = ResponseCookie.from(ANON_SHORTEN_COOKIE, "1")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(365))
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(urlMappingDTO);
    }


    @GetMapping("/myurls")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UrlMappingDTO>> getUserUrls(Principal principal){
        User user = userService.findByUsername(principal.getName());
        List<UrlMappingDTO> urls = urlMappingService.getUrlsByUser(user);
        return ResponseEntity.ok(urls);
    }

    @DeleteMapping("/{shortUrl}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteShortUrl(@PathVariable String shortUrl, Principal principal) {
        User user = userService.findByUsername(principal.getName());
        return switch (urlMappingService.deleteShortUrlOwnedBy(user, shortUrl)) {
            case DELETED -> ResponseEntity.noContent().build();
            case FORBIDDEN -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            case NOT_FOUND -> ResponseEntity.notFound().build();
        };
    }


    @GetMapping("/analytics/{shortUrl}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ClickEventDTO>> getUrlAnalytics(@PathVariable String shortUrl,
                                                               @RequestParam("startDate") String startDate,
                                                               @RequestParam("endDate") String endDate){
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        List<ClickEventDTO> clickEventDTOS = urlMappingService.getClickEventsByDate(shortUrl, start, end);
        if (clickEventDTOS == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clickEventDTOS);
    }


    @GetMapping("/totalClicks")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<LocalDate, Long>> getTotalClicksByDate(Principal principal,
                                                                     @RequestParam("startDate") String startDate,
                                                                     @RequestParam("endDate") String endDate){
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
        User user = userService.findByUsername(principal.getName());
        LocalDate start = LocalDate.parse(startDate, formatter);
        LocalDate end = LocalDate.parse(endDate, formatter);
        Map<LocalDate, Long> totalClicks = urlMappingService.getTotalClicksByUserAndDate(user, start, end);
        return ResponseEntity.ok(totalClicks);
    }
}
