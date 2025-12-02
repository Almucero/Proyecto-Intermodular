package com.gamesage.kotlin.data.local.platform

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Platform
import java.time.LocalDateTime

@Entity(tableName = "platforms")
data class PlatformEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val createdAt: String,
    val updatedAt: String
)

fun Platform.toEntity(): PlatformEntity {
    return PlatformEntity(
        id = this.id,
        name = this.name,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString()
    )
}

fun List<Platform>.toEntity(): List<PlatformEntity> = this.map(Platform::toEntity)

fun PlatformEntity.toModel(): Platform {
    return Platform(
        id = this.id,
        name = this.name,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        games = null
    )
}

fun List<PlatformEntity>.toModel(): List<Platform> = this.map(PlatformEntity::toModel)