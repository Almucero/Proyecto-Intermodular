package com.gamesage.kotlin.data.repository.publisher

import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.model.Publisher
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class PublisherRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: PublisherDataSource,
    @LocalDataSource private val localDataSource: PublisherDataSource,
    private val scope: CoroutineScope
): PublisherRepository {
    override suspend fun readOne(id: Long): Result<Publisher> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Publisher>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Publisher>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(publisherList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}