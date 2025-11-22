package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class Developer(
    val id: Int,
    val name: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val games: List<Game> = emptyList() //Cuidado
)
