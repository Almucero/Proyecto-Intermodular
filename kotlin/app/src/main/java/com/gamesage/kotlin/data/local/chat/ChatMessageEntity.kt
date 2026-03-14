package com.gamesage.kotlin.data.local.chat

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.ChatMessage
import java.time.LocalDateTime

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val localId: Int = 0, // Using local auto-generated ID because assistant messages might not always have remote IDs immediately 
    val id: Int?, // Remote ID
    val sessionId: Int,
    val role: String,
    val content: String,
    val createdAt: String?,
    val games: String? // Stored as JSON string
)

fun ChatMessage.toEntity(): ChatMessageEntity {
    val converters = ChatConverters()
    return ChatMessageEntity(
        id = this.id,
        sessionId = this.sessionId,
        role = this.role,
        content = this.content,
        createdAt = this.createdAt?.toString(),
        games = converters.fromGameResultList(this.games)
    )
}

fun List<ChatMessage>.toEntity(): List<ChatMessageEntity> = this.map(ChatMessage::toEntity)

fun ChatMessageEntity.toModel(): ChatMessage {
    val converters = ChatConverters()
    return ChatMessage(
        id = this.id,
        sessionId = this.sessionId,
        role = this.role,
        content = this.content,
        createdAt = this.createdAt?.let { LocalDateTime.parse(it) },
        games = converters.toGameResultList(this.games)
    )
}

fun List<ChatMessageEntity>.toModel(): List<ChatMessage> = this.map(ChatMessageEntity::toModel)
