package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.model.GameResult
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

data class ChatMessageApiModel(
    val id: Int? = null,
    val role: String,
    val content: String,
    val createdAt: String? = null,
    val games: List<GameResultApiModel>? = null
)

data class ChatSessionApiModel(
    val id: Int,
    val userId: Int? = null,
    val title: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val messages: List<ChatMessageApiModel>? = null,
    val count: ChatCountApiModel? = null
)

data class ChatCountApiModel(
    val messages: Int
)

data class GameResultApiModel(
    val id: Int,
    val title: String,
    val price: String,
    val genres: String,
    val platforms: String
)

data class ChatResponseApiModel(
    val sessionId: Int,
    val text: String,
    val games: List<GameResultApiModel>
)

data class SendMessageRequest(
    val message: String,
    val sessionId: Int? = null
)

fun ChatSessionApiModel.toModel(): ChatSession {
    return ChatSession(
        id = id,
        userId = userId,
        title = title,
        createdAt = createdAt?.let { try { LocalDateTime.parse(it, DateTimeFormatter.ISO_DATE_TIME) } catch (_: Exception) { null } },
        updatedAt = updatedAt?.let { try { LocalDateTime.parse(it, DateTimeFormatter.ISO_DATE_TIME) } catch (_: Exception) { null } },
        messages = messages?.map { it.toModel(id) },
        count = count?.messages
    )
}

fun ChatMessageApiModel.toModel(sessionId: Int): ChatMessage {
    return ChatMessage(
        id = id,
        sessionId = sessionId,
        role = role,
        content = content,
        createdAt = createdAt?.let { try { LocalDateTime.parse(it, DateTimeFormatter.ISO_DATE_TIME) } catch (_: Exception) { null } },
        games = games?.map { it.toModel() }
    )
}

fun GameResultApiModel.toModel(): GameResult {
    return GameResult(
        id = id,
        title = title,
        price = price,
        genres = genres,
        platforms = platforms
    )
}
