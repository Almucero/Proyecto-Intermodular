package com.gamesage.kotlin.data.local.game

import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.local.game.exceptions.GameNotFoundException
import com.gamesage.kotlin.data.model.Game
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import com.gamesage.kotlin.data.local.media.MediaDao
import com.gamesage.kotlin.data.local.media.toEntity
import com.gamesage.kotlin.data.local.media.toModel
import kotlinx.coroutines.flow.map

class GameLocalDataSource @Inject constructor(
    private val gameDao: GameDao,
    private val mediaDao: MediaDao
): GameDataSource {
    override suspend fun addAll(gameList: List<Game>) {
        withContext(Dispatchers.IO) {
            gameDao.insert(gameList.toEntity())
            gameList.forEach { game ->
                game.media?.let { mediaList ->
                    val mediaEntities = mediaList.map { it.toEntity().copy(gameId = game.id) }
                    mediaDao.insert(mediaEntities)
                }
            }
        }
    }

    override suspend fun addOne(game: Game) {
        withContext(Dispatchers.IO) {
            gameDao.insert(game.toEntity())
            game.media?.let { mediaList ->
                val mediaEntities = mediaList.map { it.toEntity().copy(gameId = game.id) }
                mediaDao.insert(mediaEntities)
            }
        }
    }
    
    override fun observe(): Flow<Result<List<Game>>> {
        return gameDao.observeAll().map { entities ->
            val allMedia = mediaDao.getAll().toModel()
            val mediaByGame = allMedia.groupBy { it.gameId }
            
            val games = entities.map { entity ->
                entity.toModel().copy(media = mediaByGame[entity.id] ?: emptyList())
            }
            Result.success(games)
        }
    }
    
    override suspend fun readAll(): Result<List<Game>> {
        return withContext(Dispatchers.IO) {
            val entities = gameDao.getAll()
            val allMedia = mediaDao.getAll().toModel()
            val mediaByGame = allMedia.groupBy { it.gameId }
            
            val games = entities.map { entity ->
                entity.toModel().copy(media = mediaByGame[entity.id] ?: emptyList())
            }
            Result.success(games)
        }
    }
    
    override suspend fun readOne(id: Long): Result<Game> {
        return withContext(Dispatchers.IO) {
            val entity = gameDao.readGameById(id)
            if (entity == null) {
                Result.failure(GameNotFoundException())
            } else {
                val gameMedia = mediaDao.getAll()
                    .filter { it.gameId == id.toInt() }
                    .toModel()
                Result.success(entity.toModel().copy(media = gameMedia))
            }
        }
    }
}