package com.gamesage.kotlin.data.remote.model

import com.google.gson.annotations.SerializedName
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.GameResult
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

data class ChatMessageApiModel(
    @SerializedName("id") val id: Int? = null,
    @SerializedName("role") val role: String, // "user" or "assistant"
    @SerializedName("content") val content: String,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("games") val games: List<GameResultApiModel>? = null
)

data class ChatSessionApiModel(
    @SerializedName("id") val id: Int,
    @SerializedName("userId") val userId: Int? = null,
    @SerializedName("title") val title: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null,
    @SerializedName("messages") val messages: List<ChatMessageApiModel>? = null,
    @SerializedName("_count") val count: ChatCountApiModel? = null
)

data class ChatCountApiModel(
    @SerializedName("messages") val messages: Int
)

data class GameResultApiModel(
    @SerializedName("id") val id: Int,
    @SerializedName("title") val title: String,
    @SerializedName("price") val price: String,
    @SerializedName("genres") val genres: String,
    @SerializedName("platforms") val platforms: String
)

data class ChatResponseApiModel(
    @SerializedName("sessionId") val sessionId: Int,
    @SerializedName("text") val text: String,
    @SerializedName("games") val games: List<GameResultApiModel>
)

data class SendMessageRequest(
    @SerializedName("message") val message: String,
    @SerializedName("sessionId") val sessionId: Int? = null
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
