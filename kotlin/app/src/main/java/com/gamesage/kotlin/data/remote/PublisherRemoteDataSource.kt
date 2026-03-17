package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.model.Publisher
import com.gamesage.kotlin.data.remote.api.PublishersApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class PublisherRemoteDataSource @Inject constructor(
    @Suppress("unused") private val api: PublishersApi,
    @Suppress("unused") private val scope: CoroutineScope
): PublisherDataSource {
    override suspend fun addAll(publisherList: List<Publisher>) {
        TODO("Sin implementar")
    }
    override fun observe(): Flow<Result<List<Publisher>>> {
        TODO("Sin implementar")
    }
    override suspend fun readAll(): Result<List<Publisher>> {
        TODO("Sin implementar")
    }
    override suspend fun readOne(id: Long): Result<Publisher> {
        TODO("Sin implementar")
    }
}