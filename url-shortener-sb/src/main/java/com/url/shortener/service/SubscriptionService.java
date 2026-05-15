package com.url.shortener.service;

import com.url.shortener.dtos.PlanLimitsDTO;
import com.url.shortener.dtos.PricingCatalogDTO;
import com.url.shortener.dtos.PricingPlanDTO;
import com.url.shortener.dtos.UserSubscriptionDTO;
import com.url.shortener.models.SubscriptionTier;
import com.url.shortener.models.User;
import com.url.shortener.repository.UrlMappingRepository;
import com.url.shortener.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class SubscriptionService {

    public static final double ANNUAL_DISCOUNT_RATE = 0.17;
    public static final int INR_PER_USD_DISPLAY = 83;

    private static final Map<SubscriptionTier, PlanLimitsDTO> LIMITS = new EnumMap<>(SubscriptionTier.class);

    static {
        LIMITS.put(SubscriptionTier.STARTER, new PlanLimitsDTO(
                100,
                50,
                0,
                0,
                false,
                false,
                false
        ));
        LIMITS.put(SubscriptionTier.PRO, new PlanLimitsDTO(
                5_000,
                2_500,
                5,
                50,
                true,
                true,
                false
        ));
        LIMITS.put(SubscriptionTier.BUSINESS, new PlanLimitsDTO(
                15_000,
                7_500,
                15,
                150,
                true,
                true,
                true
        ));
    }

    private UrlMappingRepository urlMappingRepository;
    private UserRepository userRepository;

    public PricingCatalogDTO getPublicCatalog() {
        List<PricingPlanDTO> plans = List.of(
                new PricingPlanDTO("starter", "free", null, copyLimits(SubscriptionTier.STARTER)),
                new PricingPlanDTO("pro", "paid", 1.0, copyLimits(SubscriptionTier.PRO)),
                new PricingPlanDTO("business", "paid", 2.0, copyLimits(SubscriptionTier.BUSINESS))
        );
        return new PricingCatalogDTO(ANNUAL_DISCOUNT_RATE, INR_PER_USD_DISPLAY, plans);
    }

    public SubscriptionTier resolveTier(User user) {
        if (user == null || user.getSubscriptionTier() == null) {
            return SubscriptionTier.STARTER;
        }
        return user.getSubscriptionTier();
    }

    public PlanLimitsDTO entitlementsFor(User user) {
        return copyLimits(resolveTier(user));
    }

    public UserSubscriptionDTO getStatus(User user) {
        SubscriptionTier tier = resolveTier(user);
        long links = urlMappingRepository.countByUser(user);
        int qr = user.getQrGenerationsCount();
        PlanLimitsDTO ent = copyLimits(tier);
        UserSubscriptionDTO.SubscriptionUsageDTO usage =
                new UserSubscriptionDTO.SubscriptionUsageDTO(links, qr);
        return new UserSubscriptionDTO(tier.name(), ent, usage);
    }

    public void assertCanCreateLink(User user) {
        if (user == null || user.getId() == null) {
            return;
        }
        PlanLimitsDTO limits = entitlementsFor(user);
        long count = urlMappingRepository.countByUser(user);
        if (count >= limits.getMaxLinks()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Link quota reached for plan " + resolveTier(user) + " (" + limits.getMaxLinks() + "). Upgrade or delete links."
            );
        }
    }

    public void assertCanGenerateQr(User user) {
        PlanLimitsDTO limits = entitlementsFor(user);
        int used = user.getQrGenerationsCount();
        if (used >= limits.getMaxQrCodes()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "QR code quota reached for plan " + resolveTier(user) + " (" + limits.getMaxQrCodes() + ")."
            );
        }
    }

    @Transactional
    public void recordQrGeneration(User user) {
        if (user == null || user.getId() == null) {
            return;
        }
        User persisted = userRepository.findById(user.getId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        );
        persisted.setQrGenerationsCount(persisted.getQrGenerationsCount() + 1);
        userRepository.save(persisted);
    }

    public void assertAdvancedAnalytics(User user) {
        if (!entitlementsFor(user).isAdvancedAnalytics()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Advanced analytics (referrers, devices, CSV export) requires Pro or Business."
            );
        }
    }

    private static PlanLimitsDTO copyLimits(SubscriptionTier tier) {
        PlanLimitsDTO src = LIMITS.get(tier);
        return new PlanLimitsDTO(
                src.getMaxLinks(),
                src.getMaxQrCodes(),
                src.getMaxCustomDomains(),
                src.getMaxCampaigns(),
                src.isAdvancedAnalytics(),
                src.isAdRemoval(),
                src.isPrioritySupport()
        );
    }
}
