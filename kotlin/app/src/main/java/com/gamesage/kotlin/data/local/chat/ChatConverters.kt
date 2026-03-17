package com.gamesage.kotlin.data.local.chat

import androidx.room.TypeConverter
import com.gamesage.kotlin.data.model.GameResult
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

// Convierte List<GameResult> a JSON y viceversa para persistir en Room.
class ChatConverters {
    private val gson = Gson()

    @TypeConverter
    fun fromGameResultList(value: List<GameResult>?): String? {
        if (value == null) return null
        val type = object : TypeToken<List<GameResult>>() {}.type
        return gson.toJson(value, type)
    }

    @TypeConverter
    fun toGameResultList(value: String?): List<GameResult>? {
        if (value == null) return null
        val type = object : TypeToken<List<GameResult>>() {}.type
        return gson.fromJson(value, type)
    }
}
