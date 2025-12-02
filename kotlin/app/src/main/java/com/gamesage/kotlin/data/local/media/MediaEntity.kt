package com.gamesage.kotlin.data.local.media

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Media
import java.time.LocalDateTime

@Entity(tableName = "media")
data class MediaEntity(
    @PrimaryKey
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
    val createdAt: String,
    val updatedAt: String,
    val gameId: Int?,
    val userId: Int?
)

fun Media.toEntity(): MediaEntity {
    return MediaEntity(
        id = this.id,
        url = this.url,
        publicId = this.publicId,
        format = this.format,
        resourceType = this.resourceType,
        bytes = this.bytes,
        width = this.width,
        height = this.height,
        originalName = this.originalName,
        folder = this.folder,
        altText = this.altText,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString(),
        gameId = this.gameId,
        userId = this.userId
    )
}

fun List<Media>.toEntity(): List<MediaEntity> = this.map(Media::toEntity)

fun MediaEntity.toModel(): Media {
    return Media(
        id = this.id,
        url = this.url,
        publicId = this.publicId,
        format = this.format,
        resourceType = this.resourceType,
        bytes = this.bytes,
        width = this.width,
        height = this.height,
        originalName = this.originalName,
        folder = this.folder,
        altText = this.altText,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        gameId = this.gameId,
        userId = this.userId,
        Game = null,
        User = null
    )
}

fun List<MediaEntity>.toModel(): List<Media> = this.map(MediaEntity::toModel)