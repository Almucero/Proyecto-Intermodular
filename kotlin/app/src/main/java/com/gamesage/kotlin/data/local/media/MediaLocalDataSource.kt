package com.gamesage.kotlin.data.local.media

import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.model.Media
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class MediaLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val mediaDao: MediaDao
): MediaDataSource {
    override suspend fun addAll(mediaList: List<Media>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Media>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Media>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Media> {
        TODO("Not yet implemented")
    }
}