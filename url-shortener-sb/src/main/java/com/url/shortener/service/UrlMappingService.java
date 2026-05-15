package com.url.shortener.service;

import com.url.shortener.dtos.ClickEventDTO;
import com.url.shortener.dtos.AnalyticsDailyDTO;
import com.url.shortener.dtos.AnalyticsBreakdownDTO;
import com.url.shortener.dtos.AnalyticsOverviewDTO;
import com.url.shortener.dtos.KeyCountDTO;
import com.url.shortener.dtos.LinkAnalyticsDTO;
import com.url.shortener.dtos.TopLinkDTO;
import com.url.shortener.dtos.UrlMappingDTO;
import com.url.shortener.models.ClickEvent;
import com.url.shortener.models.UrlMapping;
import com.url.shortener.models.User;
import com.url.shortener.repository.ClickEventRepository;
import com.url.shortener.repository.UrlMappingRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UrlMappingService {

    public enum OwnedShortUrlDeleteResult {
        NOT_FOUND,
        FORBIDDEN,
        DELETED
    }

    private UrlMappingRepository urlMappingRepository;
    private ClickEventRepository clickEventRepository;
    private PasswordEncoder passwordEncoder;
    private SubscriptionService subscriptionService;

    public UrlMappingDTO createShortUrl(String originalUrl, User user) {
        if (user != null) {
            subscriptionService.assertCanCreateLink(user);
        }
        String shortUrl = generateShortUrl();
        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortUrl(shortUrl);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());
        UrlMapping savedUrlMapping = urlMappingRepository.save(urlMapping);
        return convertToDto(savedUrlMapping);
    }

    public UrlMappingDTO createShortUrlAdvanced(
            String originalUrl,
            String customAlias,
            String password,
            LocalDateTime expiresAt,
            User user
    ) {
        subscriptionService.assertCanCreateLink(user);
        String shortUrl;
        if (customAlias != null && !customAlias.trim().isEmpty()) {
            shortUrl = customAlias.trim();
            if (urlMappingRepository.existsByShortUrl(shortUrl)) {
                throw new IllegalArgumentException("customAlias already in use");
            }
        } else {
            shortUrl = generateShortUrl();
        }

        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortUrl(shortUrl);
        urlMapping.setUser(user);
        urlMapping.setCreatedDate(LocalDateTime.now());
        urlMapping.setExpiresAt(expiresAt);

        if (password != null && !password.trim().isEmpty()) {
            urlMapping.setPasswordHash(passwordEncoder.encode(password));
        }

        UrlMapping savedUrlMapping = urlMappingRepository.save(urlMapping);
        return convertToDto(savedUrlMapping);
    }

    /** Deletes mapping and click events only when {@code user} owns the mapping. */
    @Transactional
    public OwnedShortUrlDeleteResult deleteShortUrlOwnedBy(User user, String shortUrl) {
        if (shortUrl == null || shortUrl.trim().isEmpty() || user == null || user.getId() == null) {
            return OwnedShortUrlDeleteResult.NOT_FOUND;
        }
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortUrl.trim());
        if (mapping == null) {
            return OwnedShortUrlDeleteResult.NOT_FOUND;
        }
        if (mapping.getUser() == null || mapping.getUser().getId() == null) {
            return OwnedShortUrlDeleteResult.FORBIDDEN;
        }
        if (!mapping.getUser().getId().equals(user.getId())) {
            return OwnedShortUrlDeleteResult.FORBIDDEN;
        }
        clickEventRepository.deleteByUrlMapping(mapping);
        urlMappingRepository.delete(mapping);
        return OwnedShortUrlDeleteResult.DELETED;
    }

    private UrlMappingDTO convertToDto(UrlMapping urlMapping){
        UrlMappingDTO urlMappingDTO = new UrlMappingDTO();
        urlMappingDTO.setId(urlMapping.getId());
        urlMappingDTO.setOriginalUrl(urlMapping.getOriginalUrl());
        urlMappingDTO.setShortUrl(urlMapping.getShortUrl());
        urlMappingDTO.setClickCount(urlMapping.getClickCount());
        urlMappingDTO.setCreatedDate(urlMapping.getCreatedDate());
        urlMappingDTO.setUsername(urlMapping.getUser() != null ? urlMapping.getUser().getUsername() : null);
        return urlMappingDTO;
    }

    private String generateShortUrl() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        Random random = new Random();
        for (int attempt = 0; attempt < 6; attempt++) {
            StringBuilder shortUrl = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                shortUrl.append(characters.charAt(random.nextInt(characters.length())));
            }
            String candidate = shortUrl.toString();
            if (!urlMappingRepository.existsByShortUrl(candidate)) return candidate;
        }
        // fallback: very unlikely
        String candidate = String.valueOf(System.currentTimeMillis());
        return candidate.substring(candidate.length() - 8);
    }

    public List<UrlMappingDTO> getUrlsByUser(User user) {
        return urlMappingRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<ClickEventDTO> getClickEventsByDate(String shortUrl, LocalDateTime start, LocalDateTime end) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        if (urlMapping != null) {
            return clickEventRepository.findByUrlMappingAndClickDateBetween(urlMapping, start, end).stream()
                    .collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()))
                    .entrySet().stream()
                    .map(entry -> {
                        ClickEventDTO clickEventDTO = new ClickEventDTO();
                        clickEventDTO.setClickDate(entry.getKey());
                        clickEventDTO.setCount(entry.getValue());
                        return clickEventDTO;
                    })
                    .collect(Collectors.toList());
        }
        return null;
    }

    public Map<LocalDate, Long> getTotalClicksByUserAndDate(User user, LocalDate start, LocalDate end) {
        List<UrlMapping> urlMappings = urlMappingRepository.findByUser(user);
        List<ClickEvent> clickEvents = clickEventRepository.findByUrlMappingInAndClickDateBetween(urlMappings, start.atStartOfDay(), end.plusDays(1).atStartOfDay());
        return clickEvents.stream()
                .collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()));

    }

    public AnalyticsOverviewDTO getAnalyticsOverview(User user, LocalDate start, LocalDate end) {
        if (user == null) {
            return new AnalyticsOverviewDTO(List.of(), 0, 0, 0, null, null, null);
        }
        if (start == null || end == null || end.isBefore(start)) {
            LocalDate today = LocalDate.now();
            start = today.minusDays(29);
            end = today;
        }

        // inclusive start/end -> [start@00:00, end+1@00:00)
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        Map<LocalDate, Long> grouped = getTotalClicksByUserAndDate(user, start, end);
        List<AnalyticsDailyDTO> series = fillDailySeries(grouped, start, end);

        long totalClicks = series.stream().mapToLong(AnalyticsDailyDTO::getClicks).sum();

        LocalDate today = LocalDate.now();
        long clicksToday = grouped.getOrDefault(today, 0L);

        long activeLinks = urlMappingRepository.countByUser(user);

        TopLinkDTO topLink = null;
        var topRows = clickEventRepository.findTopLinksForUser(user, startDt, endExclusive, PageRequest.of(0, 1));
        if (topRows != null && !topRows.isEmpty()) {
            var row = topRows.get(0);
            topLink = new TopLinkDTO(row.getShortUrl(), row.getClicks());
        }

        // Comparison to previous range of equal length
        long days = (long) (end.toEpochDay() - start.toEpochDay() + 1);
        LocalDate prevEnd = start.minusDays(1);
        LocalDate prevStart = prevEnd.minusDays(days - 1);
        Map<LocalDate, Long> prevGrouped = getTotalClicksByUserAndDate(user, prevStart, prevEnd);
        long prevTotal = prevGrouped.values().stream().mapToLong(Long::longValue).sum();

        Double percentChange = null;
        if (prevTotal > 0) {
            percentChange = ((double) (totalClicks - prevTotal) / (double) prevTotal) * 100.0;
        } else if (totalClicks > 0) {
            percentChange = 100.0;
        } else {
            percentChange = 0.0;
        }

        return new AnalyticsOverviewDTO(series, totalClicks, clicksToday, activeLinks, topLink, prevTotal, percentChange);
    }

    public LinkAnalyticsDTO getLinkAnalytics(User user, String shortUrl, LocalDate start, LocalDate end) {
        if (shortUrl == null || shortUrl.trim().isEmpty() || user == null) {
            return null;
        }
        if (start == null || end == null || end.isBefore(start)) {
            LocalDate today = LocalDate.now();
            start = today.minusDays(29);
            end = today;
        }
        UrlMapping mapping = urlMappingRepository.findByShortUrl(shortUrl.trim());
        if (mapping == null || mapping.getUser() == null || mapping.getUser().getId() == null) {
            return null;
        }
        if (!mapping.getUser().getId().equals(user.getId())) {
            return null;
        }

        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();
        List<ClickEvent> clickEvents = clickEventRepository.findByUrlMappingAndClickDateBetween(mapping, startDt, endExclusive);

        Map<LocalDate, Long> grouped = clickEvents.stream()
                .collect(Collectors.groupingBy(click -> click.getClickDate().toLocalDate(), Collectors.counting()));

        List<AnalyticsDailyDTO> series = fillDailySeries(grouped, start, end);
        long totalClicks = series.stream().mapToLong(AnalyticsDailyDTO::getClicks).sum();

        return new LinkAnalyticsDTO(mapping.getShortUrl(), series, totalClicks);
    }

    private List<AnalyticsDailyDTO> fillDailySeries(Map<LocalDate, Long> grouped, LocalDate start, LocalDate end) {
        Map<LocalDate, Long> safe = grouped == null ? new HashMap<>() : grouped;
        long days = (long) (end.toEpochDay() - start.toEpochDay() + 1);
        return java.util.stream.LongStream.range(0, days)
                .mapToObj(i -> {
                    LocalDate d = start.plusDays(i);
                    return new AnalyticsDailyDTO(d, safe.getOrDefault(d, 0L));
                })
                .toList();
    }

    public UrlMapping getOriginalUrl(String shortUrl) {
        return getOriginalUrl(shortUrl, null, null);
    }

    public UrlMapping getOriginalUrl(String shortUrl, String referrer, String userAgent) {
        UrlMapping urlMapping = urlMappingRepository.findByShortUrl(shortUrl);
        if (urlMapping != null) {
            urlMapping.setClickCount(urlMapping.getClickCount() + 1);
            urlMappingRepository.save(urlMapping);

            // Record Click Event
            ClickEvent clickEvent = new ClickEvent();
            clickEvent.setClickDate(LocalDateTime.now());
            clickEvent.setUrlMapping(urlMapping);
            clickEvent.setReferrer(sanitize(referrer, 512));
            clickEvent.setUserAgent(sanitize(userAgent, 512));
            clickEvent.setDeviceType(classifyDeviceType(userAgent));
            clickEventRepository.save(clickEvent);
        }

        return urlMapping;
    }

    public AnalyticsBreakdownDTO getAnalyticsBreakdown(User user, LocalDate start, LocalDate end) {
        if (user == null) {
            return new AnalyticsBreakdownDTO(List.of(), List.of());
        }
        if (start == null || end == null || end.isBefore(start)) {
            LocalDate today = LocalDate.now();
            start = today.minusDays(29);
            end = today;
        }
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        var refRows = clickEventRepository.referrerBreakdown(user, startDt, endExclusive, PageRequest.of(0, 8));
        var devRows = clickEventRepository.deviceBreakdown(user, startDt, endExclusive, PageRequest.of(0, 6));

        List<KeyCountDTO> topReferrers = refRows.stream()
                .map(r -> new KeyCountDTO(r.getKey(), r.getClicks()))
                .toList();
        List<KeyCountDTO> devices = devRows.stream()
                .map(r -> new KeyCountDTO(r.getKey(), r.getClicks()))
                .toList();

        return new AnalyticsBreakdownDTO(topReferrers, devices);
    }

    public String exportClicksCsv(User user, LocalDate start, LocalDate end) {
        if (user == null) return "date,shortUrl,referrer,deviceType\n";
        if (start == null || end == null || end.isBefore(start)) {
            LocalDate today = LocalDate.now();
            start = today.minusDays(29);
            end = today;
        }
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endExclusive = end.plusDays(1).atStartOfDay();

        List<UrlMapping> mappings = urlMappingRepository.findByUser(user);
        List<ClickEvent> events = clickEventRepository.findByUrlMappingInAndClickDateBetween(mappings, startDt, endExclusive);

        StringBuilder sb = new StringBuilder();
        sb.append("date,shortUrl,referrer,deviceType\n");
        for (ClickEvent e : events) {
            String date = e.getClickDate() != null
                    ? e.getClickDate().atZone(ZoneId.systemDefault()).toLocalDate().toString()
                    : "";
            String shortUrl = e.getUrlMapping() != null ? safeCsv(e.getUrlMapping().getShortUrl()) : "";
            String ref = safeCsv(e.getReferrer() == null ? "(direct)" : e.getReferrer());
            String dev = safeCsv(e.getDeviceType() == null ? "other" : e.getDeviceType());
            sb.append(date).append(",").append(shortUrl).append(",").append(ref).append(",").append(dev).append("\n");
        }
        return sb.toString();
    }

    private String sanitize(String v, int maxLen) {
        if (v == null) return null;
        String s = v.trim();
        if (s.isEmpty()) return null;
        if (s.length() <= maxLen) return s;
        return s.substring(0, maxLen);
    }

    private String classifyDeviceType(String uaRaw) {
        if (uaRaw == null) return "other";
        String ua = uaRaw.toLowerCase();
        if (ua.contains("bot") || ua.contains("spider") || ua.contains("crawler")) return "bot";
        if (ua.contains("ipad") || ua.contains("tablet")) return "tablet";
        if (ua.contains("mobi") || ua.contains("android") || ua.contains("iphone")) return "mobile";
        if (ua.contains("windows") || ua.contains("mac os") || ua.contains("linux")) return "desktop";
        return "other";
    }

    private String safeCsv(String value) {
        if (value == null) return "";
        String v = value.replace("\"", "\"\"");
        boolean needsQuotes = v.contains(",") || v.contains("\n") || v.contains("\r");
        return needsQuotes ? "\"" + v + "\"" : v;
    }

    public boolean verifyPassword(UrlMapping mapping, String password) {
        if (mapping.getPasswordHash() == null) return true;
        if (password == null) return false;
        return passwordEncoder.matches(password, mapping.getPasswordHash());
    }
}
