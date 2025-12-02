package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.MediaApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class MediaRemoteDataSource @Inject constructor(
    private val api: MediaApi,
    private val scope: CoroutineScope
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