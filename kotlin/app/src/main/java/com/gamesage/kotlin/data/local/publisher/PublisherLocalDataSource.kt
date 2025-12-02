package com.gamesage.kotlin.data.local.publisher

import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.model.Publisher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class PublisherLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val publisherDao: PublisherDao
): PublisherDataSource {
    override suspend fun addAll(publisherList: List<Publisher>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Publisher>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Publisher>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Publisher> {
        TODO("Not yet implemented")
    }
}