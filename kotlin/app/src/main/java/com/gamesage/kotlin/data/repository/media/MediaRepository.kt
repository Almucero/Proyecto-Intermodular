package com.gamesage.kotlin.data.repository.media

import com.gamesage.kotlin.data.model.Media
import kotlinx.coroutines.flow.Flow

interface MediaRepository {
    suspend fun readOne(id:Long): Result<Media>
    suspend fun readAll(): Result<List<Media>>
    fun observe(): Flow<Result<List<Media>>>
}