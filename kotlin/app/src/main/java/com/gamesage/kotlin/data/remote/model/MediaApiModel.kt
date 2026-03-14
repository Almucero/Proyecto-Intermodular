package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.Media
import com.google.gson.annotations.SerializedName
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import kotlinx.serialization.Serializable

data class MediaApiModel(
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
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val gameId: Int?,
    val userId: Int?
)

fun MediaApiModel.toDomain(): Media {
    return Media(
        id = id,
        url = url,
        publicId = publicId,
        format = format,
        resourceType = resourceType,
        bytes = bytes,
        width = width,
        height = height,
        originalName = originalName,
        folder = folder,
        altText = altText,
        createdAt = createdAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        updatedAt = updatedAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        gameId = gameId,
        Game = null,
        userId = userId,
        User = null
    )
}
