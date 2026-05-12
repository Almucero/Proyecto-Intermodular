package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class User(
    val id: Int,
    val accountId: String?,
    val email: String,
    val accountAt: String?,
    val nickname: String?,
    val name: String,
    val surname: String?,
    val passwordHash: String,
    val balance: Double?,
    val points: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val isAdmin: Boolean,
    val addressLine1: String?,
    val addressLine2: String?,
    val city: String?,
    val region: String?,
    val postalCode: String?,
    val country: String?,
    val avatar: String?,
    val media: List<Media>?,
    val emailNotificationsEnabled: Boolean? = null,
    val notificationEmail: String? = null,
    val emailNotificationLanguage: String? = null,
    val emailNotificationFrequency: String? = null,
    val emailRecommendationIntervalDays: Int? = null,
    val emailQuietHoursStart: Int? = null,
    val emailQuietHoursEnd: Int? = null,
    val emailNotificationPausedUntil: String? = null,
    val emailNotificationTopics: Map<String, Boolean>? = null
)
