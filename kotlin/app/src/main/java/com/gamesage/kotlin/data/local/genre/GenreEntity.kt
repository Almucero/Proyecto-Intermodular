package com.gamesage.kotlin.data.local.genre

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.Genre
import java.time.LocalDateTime

@Entity(tableName = "genres")
data class GenreEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val createdAt: String,
    val updatedAt: String
)

fun Genre.toEntity(): GenreEntity {
    return GenreEntity(
        id = this.id,
        name = this.name,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString()
    )
}

fun List<Genre>.toEntity(): List<GenreEntity> = this.map(Genre::toEntity)

fun GenreEntity.toModel(): Genre {
    return Genre(
        id = this.id,
        name = this.name,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        games = null
    )
}

fun List<GenreEntity>.toModel(): List<Genre> = this.map(GenreEntity::toModel)