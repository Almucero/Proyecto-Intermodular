package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class Media(
    val id: Int,
    val url: String,
    val publicId: String?,
    val format: String?,
    val resourceType: String?,
    val bytes: Int?,
    val width: Int?,
    val height: Int?,
    val originalName: String?,
    val folder: String?,
    val altText: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val gameId: Int?,
    val Game: Game?,
    val userId: Int?,
    val User: User?
)
