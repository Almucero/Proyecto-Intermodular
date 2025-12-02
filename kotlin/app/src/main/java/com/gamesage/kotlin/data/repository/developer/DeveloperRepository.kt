package com.gamesage.kotlin.data.repository.developer

import com.gamesage.kotlin.data.model.Developer
import kotlinx.coroutines.flow.Flow

interface DeveloperRepository {
    suspend fun readOne(id:Long): Result<Developer>
    suspend fun readAll(): Result<List<Developer>>
    fun observe(): Flow<Result<List<Developer>>>
}