package com.gamesage.kotlin.data

import com.gamesage.kotlin.data.model.Publisher
import kotlinx.coroutines.flow.Flow

interface PublisherDataSource {
    suspend fun addAll(publisherList: List<Publisher>)
    fun observe(): Flow<Result<List<Publisher>>>
    suspend fun readAll(): Result<List<Publisher>>
    suspend fun readOne(id: Long): Result<Publisher>
}