package com.gamesage.kotlin.data.local.media

import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.local.media.exceptions.MediaNotFoundException
import com.gamesage.kotlin.data.model.Media
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class MediaLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val mediaDao: MediaDao
): MediaDataSource {
    override suspend fun addAll(mediaList: List<Media>) {
        val mutex = Mutex()
        mediaList.forEach { media ->
            withContext(Dispatchers.IO) {
                mediaDao.insert(media.toEntity())
            }
        }    }
    override fun observe(): Flow<Result<List<Media>>> {
        val databaseFlow = mediaDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Media>> {
        val result = Result.success(mediaDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<Media> {
        val entity = mediaDao.readMediaById(id)
        return if (entity == null)
            Result.failure(MediaNotFoundException())
        else
            Result.success(entity.toModel())    }
}