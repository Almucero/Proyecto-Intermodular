package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.Publisher
import com.google.gson.annotations.SerializedName
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

data class PublisherApiModel(
    val id: Int,
    val name: String,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val games: List<GameApiModel>?
)

fun PublisherApiModel.toDomain(): Publisher {
    return Publisher(
        id = id,
        name = name,
        createdAt = createdAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        updatedAt = updatedAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        Game = null
    )
}
