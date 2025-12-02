package com.gamesage.kotlin.data.repository.media

import com.gamesage.kotlin.data.MediaDataSource
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class MediaRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: MediaDataSource,
    @LocalDataSource private val localDataSource: MediaDataSource,
    private val scope: CoroutineScope
): MediaRepository {
    override suspend fun readOne(id: Long): Result<Media> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Media>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Media>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(mediaList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}