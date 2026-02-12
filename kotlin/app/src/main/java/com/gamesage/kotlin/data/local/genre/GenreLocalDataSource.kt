package com.gamesage.kotlin.data.local.genre

import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.local.genre.exceptions.GenreNotFoundException
import com.gamesage.kotlin.data.model.Genre
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.withContext
import javax.inject.Inject

class GenreLocalDataSource @Inject constructor(
    private val scope: CoroutineScope,
    private val genreDao: GenreDao
): GenreDataSource {
    override suspend fun addAll(genreList: List<Genre>) {
        val mutex = Mutex()
        genreList.forEach { genre ->
            withContext(Dispatchers.IO) {
                genreDao.insert(genre.toEntity())
            }
        }
    }
    override fun observe(): Flow<Result<List<Genre>>> {
        val databaseFlow = genreDao.observeAll()
        return databaseFlow.map { entities ->
            Result.success(entities.toModel())
        }
    }
    override suspend fun readAll(): Result<List<Genre>> {
        val result = Result.success(genreDao.getAll().toModel())
        return result
    }

    override suspend fun readOne(id: Long): Result<Genre> {
        val entity = genreDao.readGenreById(id)
        return if (entity == null)
            Result.failure(GenreNotFoundException())
        else
            Result.success(entity.toModel())
    }
}