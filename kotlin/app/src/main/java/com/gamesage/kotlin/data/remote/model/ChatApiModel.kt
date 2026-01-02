package com.gamesage.kotlin.data.remote.model

import com.google.gson.annotations.SerializedName

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
