package com.url.shortener.models;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;
    private String password;
    private String role = "ROLE_USER";

    @Enumerated(EnumType.STRING)
    private SubscriptionTier subscriptionTier = SubscriptionTier.STARTER;

    /** DB default so existing rows survive `ddl-auto=update` when the column is added. */
    @Column(nullable = false)
    @ColumnDefault("0")
    private int qrGenerationsCount = 0;

    /** Optional: updated via Razorpay webhooks when the user upgrades/downgrades. */
    @Column(unique = true)
    private String razorpaySubscriptionId;

    private String razorpaySubscriptionStatus;
}
