package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.model.Developer
import com.gamesage.kotlin.data.remote.api.DevelopersApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DeveloperRemoteDataSource @Inject constructor(
    private val api: DevelopersApi,
    private val scope: CoroutineScope
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