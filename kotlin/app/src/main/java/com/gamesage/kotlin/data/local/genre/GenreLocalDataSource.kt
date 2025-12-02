package com.gamesage.kotlin.data.local.genre

import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.model.Genre
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GenreLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val genreDao: GenreDao
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