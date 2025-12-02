package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Platform
import kotlinx.coroutines.flow.Flow

interface PlatformDataSource {
    suspend fun addAll(platformList: List<Platform>)
    fun observe(): Flow<Result<List<Platform>>>
    suspend fun readAll(): Result<List<Platform>>
    suspend fun readOne(id: Long): Result<Platform>
}