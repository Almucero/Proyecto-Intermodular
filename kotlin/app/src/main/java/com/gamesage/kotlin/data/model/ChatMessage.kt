package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class ChatMessage(
    val id: Int?,
    val sessionId: Int,
    val role: String, // Puede ser usuario o asistente
    val content: String,
    val createdAt: LocalDateTime?,
    val games: List<GameResult>?
)
