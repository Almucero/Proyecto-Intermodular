package com.gamesage.kotlin.data.local.chat

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.ChatSession
import java.time.LocalDateTime

@Entity(tableName = "chat_sessions")
data class ChatSessionEntity(
    @PrimaryKey
    val id: Int,
    val userId: Int?,
    val title: String?,
    val createdAt: String?,
    val updatedAt: String?,
    val count: Int?
)

fun ChatSession.toEntity(): ChatSessionEntity {
    return ChatSessionEntity(
        id = this.id,
        userId = this.userId,
        title = this.title,
        createdAt = this.createdAt?.toString(),
        updatedAt = this.updatedAt?.toString(),
        count = this.count
    )
}

fun List<ChatSession>.toEntity(): List<ChatSessionEntity> = this.map(ChatSession::toEntity)

fun ChatSessionEntity.toModel(messages: List<com.gamesage.kotlin.data.model.ChatMessage>? = null): ChatSession {
    return ChatSession(
        id = this.id,
        userId = this.userId,
        title = this.title,
        createdAt = this.createdAt?.let { LocalDateTime.parse(it) },
        updatedAt = this.updatedAt?.let { LocalDateTime.parse(it) },
        messages = messages,
        count = this.count
    )
}

fun List<ChatSessionEntity>.toModel(): List<ChatSession> = this.map { it.toModel() }
