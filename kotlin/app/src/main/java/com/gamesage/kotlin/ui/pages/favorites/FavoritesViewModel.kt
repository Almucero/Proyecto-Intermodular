package com.gamesage.kotlin.ui.pages.favorites

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.cart.CartRepository
import com.gamesage.kotlin.data.repository.favorites.FavoritesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.io.IOException

data class FavoriteItemUiState(
    val gameId: Int,
    val title: String,
    val developerName: String?,
    val platformId: Int,
    val platformName: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val imageUrl: String
)

sealed class FavoritesUiState {
    object Initial : FavoritesUiState()
    object Loading : FavoritesUiState()
    data class Success(val games: List<FavoriteItemUiState>) : FavoritesUiState()
    data class Error(val message: String) : FavoritesUiState()
}

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val favoritesRepository: FavoritesRepository,
    private val cartRepository: CartRepository,
    @Suppress("unused") private val applicationScope: CoroutineScope,
    private val loadingManager: com.gamesage.kotlin.utils.LoadingManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<FavoritesUiState>(FavoritesUiState.Initial)
    val uiState: StateFlow<FavoritesUiState> = _uiState.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        // Enchufamos directamente a la base de datos local
        observeFavorites()
    }

    private fun observeFavorites() {
        viewModelScope.launch {
            _uiState.value = FavoritesUiState.Loading
            kotlinx.coroutines.delay(400)

            // Nos enganchamos al Flow de Room. Cada vez que cambie algo, esto se repintará solo.
            favoritesRepository.observe().collect { result ->
                if (result.isSuccess) {
                    val games = result.getOrNull() ?: emptyList()
                    _uiState.value = FavoritesUiState.Success(
                        games = games.map { it.asFavoriteItemUiState() }
                    )
                } else {
                    val e = result.exceptionOrNull()
                    val displayMessage = if (e is IOException) {
                        "Error al cargar favoritos: se necesita conexión a internet"
                    } else {
                        "Error al cargar favoritos: ${e?.message ?: "desconocido"}"
                    }
                    _uiState.value = FavoritesUiState.Error(displayMessage)
                }
            }
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun removeFromFavorites(gameId: Int, platformId: Int) {
        viewModelScope.launch {
            loadingManager.setBlocking(true)
            val result = favoritesRepository.remove(gameId, platformId)
            if (result.isFailure) {
                _errorMessage.value = "Error al eliminar: comprueba tu conexión"
            }
            loadingManager.setBlocking(false)
        }
    }

    fun addToCart(game: FavoriteItemUiState) {
        viewModelScope.launch {
            loadingManager.setBlocking(true)
            val addResult = cartRepository.add(game.gameId, game.platformId, 1)
            if (addResult.isSuccess) {
                val removeResult = favoritesRepository.remove(game.gameId, game.platformId)
                if (removeResult.isFailure) {
                    _errorMessage.value = "Error al eliminar de favoritos: comprueba tu conexión"
                }
            } else {
                _errorMessage.value = "Error al añadir al carrito: comprueba tu conexión"
            }
            loadingManager.setBlocking(false)
        }
    }

    fun transferAllToCart() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            viewModelScope.launch {
                loadingManager.setBlocking(true)
                var hasError = false
                val jobs = currentState.games.map { game ->
                    async {
                        val addRes = cartRepository.add(game.gameId, game.platformId, 1)
                        if (addRes.isSuccess) {
                            val remRes = favoritesRepository.remove(game.gameId, game.platformId)
                            if (remRes.isFailure) hasError = true
                        } else {
                            hasError = true
                        }
                    }
                }
                jobs.awaitAll()
                if (hasError) {
                    _errorMessage.value = "Algunos juegos no pudieron transferirse"
                }
                loadingManager.setBlocking(false)
            }
        }
    }

    fun clearFavorites() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            viewModelScope.launch {
                loadingManager.setBlocking(true)
                var hasError = false
                val jobs = currentState.games.map { game ->
                    async {
                        val result = favoritesRepository.remove(game.gameId, game.platformId)
                        if (result.isFailure) hasError = true
                    }
                }
                jobs.awaitAll()
                if (hasError) {
                    _errorMessage.value = "Error al vaciar favoritos: comprueba tu conexión"
                }
                loadingManager.setBlocking(false)
            }
        }
    }
}

// Convertidor (Debe ir fuera de la clase)
fun Game.asFavoriteItemUiState(): FavoriteItemUiState {
    return FavoriteItemUiState(
        gameId = this.id,
        title = this.title,
        developerName = this.Developer?.name,
        platformId = this.platforms?.firstOrNull()?.id ?: 0,
        platformName = this.platforms?.firstOrNull()?.name ?: "Múltiple",
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        imageUrl = this.media?.firstOrNull()?.url ?: ""
    )
}