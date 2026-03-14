package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class ChatSession(
    val id: Int,
    val userId: Int?,
    val title: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
    val messages: List<ChatMessage>?,
    val count: Int?
)
