package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class Genre(
    val id: Int,
    val name: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val games: List<Game>?
)
