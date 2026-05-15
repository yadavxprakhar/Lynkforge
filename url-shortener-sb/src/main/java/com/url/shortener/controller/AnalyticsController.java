package com.url.shortener.controller;

import com.url.shortener.dtos.AnalyticsOverviewDTO;
import com.url.shortener.dtos.AnalyticsBreakdownDTO;
import com.url.shortener.dtos.LinkAnalyticsDTO;
import com.url.shortener.models.User;
import com.url.shortener.service.SubscriptionService;
import com.url.shortener.service.UrlMappingService;
import com.url.shortener.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
@AllArgsConstructor
public class AnalyticsController {

    private final UrlMappingService urlMappingService;
    private final UserService userService;
    private final SubscriptionService subscriptionService;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AnalyticsOverviewDTO> overview(
            Principal principal,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        User user = userService.findByUsername(principal.getName());
        return ResponseEntity.ok(urlMappingService.getAnalyticsOverview(user, start, end));
    }

    @GetMapping("/links/{shortUrl}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<LinkAnalyticsDTO> linkAnalytics(
            Principal principal,
            @PathVariable String shortUrl,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        User user = userService.findByUsername(principal.getName());
        LinkAnalyticsDTO dto = urlMappingService.getLinkAnalytics(user, shortUrl, start, end);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/breakdown")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AnalyticsBreakdownDTO> breakdown(
            Principal principal,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        User user = userService.findByUsername(principal.getName());
        subscriptionService.assertAdvancedAnalytics(user);
        return ResponseEntity.ok(urlMappingService.getAnalyticsBreakdown(user, start, end));
    }

    @GetMapping(value = "/export.csv", produces = "text/csv")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> exportCsv(
            Principal principal,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        User user = userService.findByUsername(principal.getName());
        subscriptionService.assertAdvancedAnalytics(user);
        String csv = urlMappingService.exportClicksCsv(user, start, end);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8")
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"lynkforge-clicks.csv\"")
                .body(csv);
    }
}

