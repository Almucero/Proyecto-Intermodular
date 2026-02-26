package com.gamesage.kotlin.ui.pages.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.game.GameRepository
import com.gamesage.kotlin.data.repository.genre.GenreRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import jakarta.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

// Modelo específico para la UI de la Home
data class GameHomeUiState(
    val id: Long,
    val title: String,
    val imageUrl: String,
    val price: Double?,
    val salePrice: Double?,
    val isOnSale: Boolean,
    val rating: Float?
)

sealed class HomeUiState {
    object Initial : HomeUiState()
    object Loading : HomeUiState()
    object Error : HomeUiState()
    data class Success(
        val bestSellers: List<GameHomeUiState>,
        val offers: List<GameHomeUiState>,
        val topRated: List<GameHomeUiState>,
        val categories: List<String>
    ) : HomeUiState()
}

@HiltViewModel
class HomeScreenViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val genreRepository: GenreRepository
) : ViewModel() {
    
    // Estado principal reactivo
    private val _uiState = MutableStateFlow<HomeUiState>(HomeUiState.Initial)
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    // Para mensajes de error (Snackbars)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        observeData()
    }

    // Observa bases de datos de forma reactiva
    private fun observeData() {
        viewModelScope.launch {
            _uiState.value = HomeUiState.Loading

            combine(
                genreRepository.observe(),
                gameRepository.observe()
            ) { genresResult, gamesResult ->
                if (genresResult.isSuccess && gamesResult.isSuccess) {
                    val genres = genresResult.getOrNull() ?: emptyList()
                    val allGames = gamesResult.getOrNull() ?: emptyList()

                    // Transformamos a modelos de UI
                    val bestSellers = allGames.sortedByDescending { it.numberOfSales }
                        .take(10)
                        .map { it.asGameHomeUiState() }
                    
                    val offers = allGames.filter { it.isOnSale }
                        .take(10)
                        .map { it.asGameHomeUiState() }
                    
                    val topRated = allGames.sortedByDescending { it.rating ?: 0f }
                        .take(10)
                        .map { it.asGameHomeUiState() }

                    HomeUiState.Success(
                        categories = genres.map { it.name },
                        bestSellers = bestSellers.ifEmpty { allGames.take(10).map { it.asGameHomeUiState() } },
                        offers = offers.ifEmpty { allGames.take(10).map { it.asGameHomeUiState() } },
                        topRated = topRated.ifEmpty { allGames.take(10).map { it.asGameHomeUiState() } }
                    )
                } else {
                    HomeUiState.Error
                }
            }.collect { state ->
                _uiState.value = state
            }
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun retry() {
        observeData()
    }
}

// Mapeador de Dominio -> UI (Igual que en Cart)
fun Game.asGameHomeUiState(): GameHomeUiState {
    return GameHomeUiState(
        id = this.id.toLong(),
        title = this.title,
        imageUrl = this.media?.firstOrNull()?.url ?: "https://via.placeholder.com/600x400",
        price = this.price,
        salePrice = this.salePrice,
        isOnSale = this.isOnSale,
        rating = this.rating
    )
}
