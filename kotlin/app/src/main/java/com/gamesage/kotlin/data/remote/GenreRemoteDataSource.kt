package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.GenreDataSource
import com.gamesage.kotlin.data.model.Genre
import com.gamesage.kotlin.data.remote.api.GamesApi
import com.gamesage.kotlin.data.remote.api.GenresApi
import com.gamesage.kotlin.data.remote.model.toDomain
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GenreRemoteDataSource @Inject constructor(
    private val api: GenresApi,
    private val scope: CoroutineScope
): GenreDataSource {
    override suspend fun addAll(genreList: List<Genre>) {
        // Not needed for remote data source
    }
    
    override fun observe(): Flow<Result<List<Genre>>> {
        // Not implemented for remote - use readAll instead
        throw UnsupportedOperationException("Use readAll() for remote data source")
    }
    
    override suspend fun readAll(): Result<List<Genre>> {
        return try {
            val response = api.readAllGenres()
            val genres = response.map { it.toDomain() }
            Result.success(genres)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    override suspend fun readOne(id: Long): Result<Genre> {
        return try {
            val response = api.readOneGenre(id.toInt())
            Result.success(response.toDomain())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}