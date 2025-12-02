package com.gamesage.kotlin.data.repository.genre

import com.gamesage.kotlin.data.model.Genre
import kotlinx.coroutines.flow.Flow

interface GenreRepository {
    suspend fun readOne(id:Long): Result<Genre>
    suspend fun readAll(): Result<List<Genre>>
    fun observe(): Flow<Result<List<Genre>>>
}