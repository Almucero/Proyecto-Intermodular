package com.gamesage.kotlin.data.local.developer

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.model.Developer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DeveloperLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val developerDao: DeveloperDao
): DeveloperDataSource {
    override suspend fun addAll(developerList: List<Developer>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Developer>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Developer>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Developer> {
        TODO("Not yet implemented")
    }
}