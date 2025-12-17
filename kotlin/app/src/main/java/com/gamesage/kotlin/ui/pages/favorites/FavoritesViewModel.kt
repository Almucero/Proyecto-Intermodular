package com.gamesage.kotlin.ui.pages.favorites

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.favorites.FavoritesRepository
import com.gamesage.kotlin.data.repository.cart.CartRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class FavoritesUiState {
    object Loading : FavoritesUiState()
    data class Success(val games: List<Game>) : FavoritesUiState()
    data class Error(val message: String) : FavoritesUiState()
    object Empty : FavoritesUiState()
}

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val favoritesRepository: FavoritesRepository,
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<FavoritesUiState>(FavoritesUiState.Loading)
    val uiState: StateFlow<FavoritesUiState> = _uiState.asStateFlow()

    init {
        loadFavorites()
    }

    fun loadFavorites() {
        viewModelScope.launch {
            _uiState.value = FavoritesUiState.Loading
            favoritesRepository.getFavorites()
                .onSuccess { games ->
                    if (games.isEmpty()) {
                        _uiState.value = FavoritesUiState.Empty
                    } else {
                        _uiState.value = FavoritesUiState.Success(games)
                    }
                }
                .onFailure { e ->
                    _uiState.value = FavoritesUiState.Error(e.message ?: "Error desconocido")
                }
        }
    }

    fun removeFromFavorites(gameId: Int, platformId: Int = 0) {
        viewModelScope.launch {
            favoritesRepository.removeFromFavorites(gameId, platformId)
                .onSuccess {
                    val currentState = _uiState.value
                    if (currentState is FavoritesUiState.Success) {
                        val updatedList = currentState.games.filter { it.id != gameId }
                        if (updatedList.isEmpty()) {
                            _uiState.value = FavoritesUiState.Empty
                        } else {
                            _uiState.value = FavoritesUiState.Success(updatedList)
                        }
                    }
                }
                .onFailure { e ->
                }
        }
    }

    fun addToCart(game: Game) {
        val platformId = game.platforms?.firstOrNull()?.id ?: 0 // Default to first available platform or 0
        viewModelScope.launch {
            cartRepository.addToCart(game.id, platformId, 1)
                .onSuccess {
                }
                .onFailure {
                }
        }
    }
    
    fun transferAllToCart() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            viewModelScope.launch {
                currentState.games.forEach { game ->
                    val platformId = game.platforms?.firstOrNull()?.id ?: 0
                    cartRepository.addToCart(game.id, platformId, 1)
                }
            }
        }
    }
}
