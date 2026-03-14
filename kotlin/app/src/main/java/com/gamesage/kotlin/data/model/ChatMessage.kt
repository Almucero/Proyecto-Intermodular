package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class ChatMessage(
    val id: Int?,
    val sessionId: Int, // Associated session
    val role: String, // "user" or "assistant"
    val content: String,
    val createdAt: LocalDateTime?,
    val games: List<GameResult>?
)
