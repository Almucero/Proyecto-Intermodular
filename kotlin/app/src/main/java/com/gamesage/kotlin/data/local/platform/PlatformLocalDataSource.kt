package com.gamesage.kotlin.data.local.platform

import com.gamesage.kotlin.data.PlatformDataSource
import com.gamesage.kotlin.data.model.Platform
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class PlatformLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val platformDao: PlatformDao
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