package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.Platform
import com.google.gson.annotations.SerializedName
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

data class PlatformApiModel(
    val id: Int,
    val name: String,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val games: List<GameApiModel>?
)

fun PlatformApiModel.toDomain(): Platform {
    return Platform(
        id = id,
        name = name,
        createdAt = createdAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        updatedAt = updatedAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        games = null
    )
}
