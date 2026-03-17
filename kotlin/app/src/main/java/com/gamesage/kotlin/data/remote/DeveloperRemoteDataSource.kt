package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.model.Developer
import com.gamesage.kotlin.data.remote.api.DevelopersApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class DeveloperRemoteDataSource @Inject constructor(
    @Suppress("unused") private val api: DevelopersApi,
    @Suppress("unused") private val scope: CoroutineScope
): DeveloperDataSource {
    override suspend fun addAll(developerList: List<Developer>) {
        TODO("Sin implementar")
    }
    override fun observe(): Flow<Result<List<Developer>>> {
        throw UnsupportedOperationException("Usa readAll() para remote data source")
    }
    override suspend fun readAll(): Result<List<Developer>> {
        TODO("Sin implementar")
    }
    override suspend fun readOne(id: Long): Result<Developer> {
        TODO("Sin implementar")
    }
}