package com.gamesage.kotlin.data.repository.platform

import com.gamesage.kotlin.data.model.Platform
import kotlinx.coroutines.flow.Flow

interface PlatformRepository {
    suspend fun readOne(id:Long): Result<Platform>
    suspend fun readAll(): Result<List<Platform>>
    fun observe(): Flow<Result<List<Platform>>>
}