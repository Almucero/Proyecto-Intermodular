package com.gamesage.kotlin.data.repository.developer

import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.model.Developer
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class DeveloperRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: DeveloperDataSource,
    @LocalDataSource private val localDataSource: DeveloperDataSource,
    private val scope: CoroutineScope
): DeveloperRepository {
    override suspend fun readOne(id: Long): Result<Developer> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Developer>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Developer>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(developerList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}