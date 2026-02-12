package com.gamesage.kotlin.data.local.platform

import com.gamesage.kotlin.data.PlatformDataSource
import com.gamesage.kotlin.data.local.platform.exceptions.PlatformNotFoundException
import com.gamesage.kotlin.data.model.Platform
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class PlatformLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val platformDao: PlatformDao
): PlatformDataSource {
    override suspend fun addAll(platformList: List<Platform>) {
        val mutex = Mutex()
        platformList.forEach { platform ->
            withContext(Dispatchers.IO) {
                platformDao.insert(platform.toEntity())
            }
        }    }
    override fun observe(): Flow<Result<List<Platform>>> {
        val databaseFlow = platformDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Platform>> {
        val result = Result.success(platformDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<Platform> {
        val entity = platformDao.readPlatformById(id)
        return if (entity == null)
            Result.failure(PlatformNotFoundException())
        else
            Result.success(entity.toModel())    }
}