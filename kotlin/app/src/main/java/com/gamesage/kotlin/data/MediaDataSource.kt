package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Media
import kotlinx.coroutines.flow.Flow

interface MediaDataSource {
    suspend fun addAll(mediaList: List<Media>)
    fun observe(): Flow<Result<List<Media>>>
    suspend fun readAll(): Result<List<Media>>
    suspend fun readOne(id: Long): Result<Media>
}