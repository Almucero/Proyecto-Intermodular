package com.gamesage.kotlin.ui.pages.home

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.model.Media
import dagger.hilt.android.lifecycle.HiltViewModel
import jakarta.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime

@HiltViewModel
class HomeScreenViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Initial)
    val uiState: StateFlow<UiState> get() = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun fakeGame(id: Int): Game {
        val fakeImage = Media(
            id = id,
            url = "https://via.placeholder.com/600x400",
            altText = "Juego $id",
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            gameId = id,
            game = null
        )

        return Game(
            id = id,
            title = "Juego $id",
            description = "Descripción de prueba del juego $id",
            price = 59.99,
            isOnSale = id % 2 == 0,
            salePrice = if (id % 2 == 0) 29.99 else null,
            isRefundable = true,
            numberOfSales = (5000..200000).random(),
            rating = (1..5).random().toFloat(),
            releaseDate = LocalDateTime.now(),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            genres = emptyList(),
            platforms = emptyList(),
            images = listOf(fakeImage),
            publisherId = null,
            developerId = null,
            publisher = null,
            developer = null
        )
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            delay(600)

            _uiState.value = UiState.Success(
                categories = listOf(
                    "Acción", "Aventura", "RPG", "Deportes",
                    "Estrategia", "Simulación", "Terror", "Carreras"
                ),
                bestSellers = List(10) { fakeGame(it + 1) },
                offers = List(10) { fakeGame(it + 100) },
                topRated = List(10) { fakeGame(it + 200) }
            )
        }
    }
}

sealed class UiState {
    object Initial : UiState()
    object Loading : UiState()
    object Error : UiState()
    data class Success(
        val bestSellers: List<Game>,
        val offers: List<Game>,
        val topRated: List<Game>,
        val categories: List<String>
    ) : UiState()
}