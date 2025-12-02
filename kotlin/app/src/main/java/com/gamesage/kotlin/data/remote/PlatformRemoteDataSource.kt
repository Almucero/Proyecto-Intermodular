package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.PlatformDataSource
import com.gamesage.kotlin.data.model.Platform
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.PlatformsApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class PlatformRemoteDataSource @Inject constructor(
    private val api: PlatformsApi,
    private val scope: CoroutineScope
): PlatformDataSource {
    override suspend fun addAll(platformList: List<Platform>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Platform>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Platform>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Platform> {
        TODO("Not yet implemented")
    }
}