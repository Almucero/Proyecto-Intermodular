package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.Media
import com.google.gson.annotations.SerializedName
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import kotlinx.serialization.Serializable

@Serializable
data class MediaApiModel(
    @SerializedName("id") val id: Int,
    @SerializedName("url") val url: String,
    @SerializedName("publicId") val publicId: String?,
    @SerializedName("format") val format: String?,
    @SerializedName("resourceType") val resourceType: String?,
    @SerializedName("bytes") val bytes: Int?,
    @SerializedName("width") val width: Int?,
    @SerializedName("height") val height: Int?,
    @SerializedName("originalName") val originalName: String?,
    @SerializedName("folder") val folder: String?,
    @SerializedName("altText") val altText: String?,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null,
    @SerializedName("gameId") val gameId: Int?,
    @SerializedName("userId") val userId: Int?
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
