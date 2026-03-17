package com.gamesage.kotlin.data.local.chat

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.ChatMessage
import java.time.LocalDateTime

// Entidad Room para la tabla de mensajes de chat.
@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
    @PrimaryKey(autoGenerate = true)
    val localId: Int = 0,
    val id: Int?,
    val sessionId: Int,
    val role: String,
    val content: String,
    val createdAt: String?,
    val games: String?
)

// Convierte ChatMessage de dominio a entidad para Room (games como JSON).
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

// Convierte la entidad a ChatMessage de dominio (games desde JSON).
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
