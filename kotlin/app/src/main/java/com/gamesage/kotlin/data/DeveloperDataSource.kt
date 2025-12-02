package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Developer
import kotlinx.coroutines.flow.Flow

interface DeveloperDataSource {
    suspend fun addAll(developerList: List<Developer>)
    fun observe(): Flow<Result<List<Developer>>>
    suspend fun readAll(): Result<List<Developer>>
    suspend fun readOne(id: Long): Result<Developer>
}