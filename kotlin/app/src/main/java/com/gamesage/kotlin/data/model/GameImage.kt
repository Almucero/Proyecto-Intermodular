package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class GameImage(
    val id: Int,
    val url: String,
    val altText: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val gameId: Int,
    val game: Game? //Cuidado
)
