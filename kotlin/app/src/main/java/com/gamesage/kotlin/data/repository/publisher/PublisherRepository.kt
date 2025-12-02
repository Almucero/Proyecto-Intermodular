package com.gamesage.kotlin.data.repository.publisher

import com.gamesage.kotlin.data.model.Publisher
import kotlinx.coroutines.flow.Flow

interface PublisherRepository {
    suspend fun readOne(id:Long): Result<Publisher>
    suspend fun readAll(): Result<List<Publisher>>
    fun observe(): Flow<Result<List<Publisher>>>
}