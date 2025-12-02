package com.gamesage.kotlin.data.repository.platform

import com.gamesage.kotlin.data.PlatformDataSource
import com.gamesage.kotlin.data.model.Platform
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class PlatformRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: PlatformDataSource,
    @LocalDataSource private val localDataSource: PlatformDataSource,
    private val scope: CoroutineScope
): PlatformRepository {
    override suspend fun readOne(id: Long): Result<Platform> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Platform>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Platform>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(platformList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}