package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.data.remote.api.MediaApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class MediaRemoteDataSource @Inject constructor(
    @Suppress("unused") private val api: MediaApi,
    @Suppress("unused") private val scope: CoroutineScope
): MediaDataSource {
    override suspend fun addAll(mediaList: List<Media>) {
        TODO("Sin implementar")
    }
    override fun observe(): Flow<Result<List<Media>>> {
        TODO("Sin implementar")
    }
    override suspend fun readAll(): Result<List<Media>> {
        TODO("Sin implementar")
    }
    override suspend fun readOne(id: Long): Result<Media> {
        TODO("Sin implementar")
    }
}