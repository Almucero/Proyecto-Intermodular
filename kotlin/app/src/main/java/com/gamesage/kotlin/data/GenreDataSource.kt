package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Genre
import kotlinx.coroutines.flow.Flow

interface GenreDataSource {
    suspend fun addAll(genreList: List<Genre>)
    fun observe(): Flow<Result<List<Genre>>>
    suspend fun readAll(): Result<List<Genre>>
    suspend fun readOne(id: Long): Result<Genre>
}