package com.gamesage.kotlin.ui.pages.home

import androidx.lifecycle.ViewModel
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.model.Genre
import com.gamesage.kotlin.data.model.Media
import com.gamesage.kotlin.data.model.Platform
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDateTime
import kotlin.random.Random

class HomeScreenViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        loadFakeData()
    }

    private fun loadFakeData() {
        val fakeGames = createFakeGames("Game", 15)
        _uiState.value = UiState.Success(
            bestSellers = fakeGames.sortedByDescending { it.numberOfSales }.take(10),
            offers = fakeGames.filter { it.isOnSale }.take(10),
            topRated = fakeGames.sortedByDescending { it.rating }.take(10),
            categories = fakeGames.flatMap { it.genres.orEmpty() }.mapNotNull { it.name }.distinct()
        )
    }

    private fun createFakeGames(prefix: String, count: Int): List<Game> {
        return (1..count).map { i ->
            val fakeGenre = Genre(
                id = i * 2,
                name = if (i % 2 == 0) "Action" else "RPG",
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                games = null
            )

            val fakePlatform = Platform(
                id = i * 3,
                name = if (i % 2 == 0) "PC" else "PlayStation 5",
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                games = null
            )

            // --- CORRECCIÓN FINAL: Objeto Media de prueba (COMPLETÍSIMO) ---
            val fakeMedia = Media(
                id = i * 4,
                url = "https://www.freetogame.com/g/540/thumbnail.jpg",
                gameId = i,
                publicId = "sample_public_id_$i",
                format = "jpg",
                resourceType = "image",
                bytes = (1000..5000).random(),
                width = 1920,
                height = 1080,
                originalName = "thumbnail.jpg",
                // Rellenando los últimos campos que faltaban
                folder = "game_thumbnails",
                altText = "Thumbnail for $prefix $i",
                Game = null, // Se deja nulo para evitar una dependencia circular con Game
                userId = null, // Asumimos que puede ser nulo si no hay un usuario asociado
                User = null,   // Asumimos que el objeto User también puede ser nulo
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )

            Game(
                id = i,
                title = "$prefix $i",
                description = "This is a detailed description for game #$i.",
                price = (10..60).random().toDouble(),
                isOnSale = i % 3 == 0,
                salePrice = if (i % 3 == 0) (5..9).random().toDouble() else null,
                isRefundable = true,
                numberOfSales = (100..1000).random(),
                stock = (0..50).random(),
                videoUrl = null,
                rating = Random.nextDouble(3.0, 5.0).toFloat(),
                releaseDate = LocalDateTime.now().minusMonths(i.toLong()),
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                publisherId = i,
                developerId = i + 100,
                genres = listOf(fakeGenre),
                platforms = listOf(fakePlatform),
                media = listOf(fakeMedia),
                Publisher = null,
                Developer = null
            )
        }
    }
}

sealed class UiState {
    object Loading : UiState()
    object Error : UiState()
    data class Success(
        val bestSellers: List<Game>,
        val offers: List<Game>,
        val topRated: List<Game>,
        val categories: List<String>
    ) : UiState()
}








