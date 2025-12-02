package com.gamesage.kotlin.data.repository.genre

import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.model.Genre
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class GenreRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: GenreDataSource,
    @LocalDataSource private val localDataSource: GenreDataSource,
    private val scope: CoroutineScope
): GenreRepository {
    override suspend fun readOne(id: Long): Result<Genre> {
        return remoteDataSource.readOne(id)
    }
    override suspend fun readAll(): Result<List<Genre>> {
        return remoteDataSource.readAll()
    }
    override fun observe(): Flow<Result<List<Genre>>> {
        scope.launch {
            remoteDataSource.observe().collect { result ->
                if (result.isSuccess) {
                    localDataSource.addAll(genreList = result.getOrNull()!!)
                }
            }
        }
        return localDataSource.observe()
    }
}