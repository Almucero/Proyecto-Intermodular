package com.gamesage.kotlin.data.local.developer

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.local.developer.exceptions.DeveloperNotFoundException
import com.gamesage.kotlin.data.model.Developer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class DeveloperLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val developerDao: DeveloperDao
): DeveloperDataSource {
    override suspend fun addAll(developerList: List<Developer>) {
        val mutex = Mutex()
        developerList.forEach { developer ->
            withContext(Dispatchers.IO) {
                developerDao.insert(developer.toEntity())
            }
        }
    }
    override fun observe(): Flow<Result<List<Developer>>> {
        val databaseFlow = developerDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Developer>> {
        val result = Result.success(developerDao.getAll().toModel())
        return result
    }
    override suspend fun readOne(id: Long): Result<Developer> {
        val entity = developerDao.readDeveloperById(id)
        return if (entity == null)
            Result.failure(DeveloperNotFoundException())
        else
            Result.success(entity.toModel())
    }
}