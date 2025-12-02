package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.model.Publisher
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.PublishersApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class PublisherRemoteDataSource @Inject constructor(
    private val api: PublishersApi,
    private val scope: CoroutineScope
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