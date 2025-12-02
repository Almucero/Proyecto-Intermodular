package com.gamesage.kotlin.data.local.developer

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Developer
import java.time.LocalDateTime

@Entity(tableName = "developers")
data class DeveloperEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val createdAt: String,
    val updatedAt: String
)

fun Developer.toEntity(): DeveloperEntity {
    return DeveloperEntity(
        id = this.id,
        name = this.name,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString()
    )
}

fun List<Developer>.toEntity(): List<DeveloperEntity> = this.map(Developer::toEntity)

fun DeveloperEntity.toModel(): Developer {
    return Developer(
        id = this.id,
        name = this.name,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        games = null
    )
}

fun List<DeveloperEntity>.toModel(): List<Developer> = this.map(DeveloperEntity::toModel)