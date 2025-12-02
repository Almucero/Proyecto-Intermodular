package com.gamesage.kotlin.data.local.publisher

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Publisher
import java.time.LocalDateTime

@Entity(tableName = "publishers")
data class PublisherEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val createdAt: String,
    val updatedAt: String
)

fun Publisher.toEntity(): PublisherEntity {
    return PublisherEntity(
        id = this.id,
        name = this.name,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString()
    )
}

fun List<Publisher>.toEntity(): List<PublisherEntity> = this.map(Publisher::toEntity)

fun PublisherEntity.toModel(): Publisher {
    return Publisher(
        id = this.id,
        name = this.name,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        Game = null
    )
}

fun List<PublisherEntity>.toModel(): List<Publisher> = this.map(PublisherEntity::toModel)