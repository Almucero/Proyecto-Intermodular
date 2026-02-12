package com.gamesage.kotlin.data.local.publisher

import com.gamesage.kotlin.data.PublisherDataSource
import com.gamesage.kotlin.data.local.publisher.exceptions.PublisherNotFoundException
import com.gamesage.kotlin.data.model.Publisher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class PublisherLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val publisherDao: PublisherDao
): PublisherDataSource {
    override suspend fun addAll(publisherList: List<Publisher>) {
        val mutex = Mutex()
        publisherList.forEach { publisher ->
            withContext(Dispatchers.IO) {
                publisherDao.insert(publisher.toEntity())
            }
        }    }
    override fun observe(): Flow<Result<List<Publisher>>> {
        val databaseFlow = publisherDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Publisher>> {
        val result = Result.success(publisherDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<Publisher> {
        val entity = publisherDao.readPublisherById(id)
        return if (entity == null)
            Result.failure(PublisherNotFoundException())
        else
            Result.success(entity.toModel())    }
}