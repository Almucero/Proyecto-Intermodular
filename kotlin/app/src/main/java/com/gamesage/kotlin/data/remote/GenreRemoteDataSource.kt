package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.model.Genre
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.GenresApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GenreRemoteDataSource @Inject constructor(
    private val api: GenresApi,
    private val scope: CoroutineScope
): GenreDataSource {
    override suspend fun addAll(genreList: List<Genre>) {
        TODO("Not yet implemented")
    }
    override fun observe(): Flow<Result<List<Genre>>> {
        TODO("Not yet implemented")
    }
    override suspend fun readAll(): Result<List<Genre>> {
        TODO("Not yet implemented")
    }
    override suspend fun readOne(id: Long): Result<Genre> {
        TODO("Not yet implemented")
    }
}