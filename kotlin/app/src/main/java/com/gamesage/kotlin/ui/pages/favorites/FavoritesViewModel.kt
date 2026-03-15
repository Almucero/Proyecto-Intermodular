package com.gamesage.kotlin.ui.pages.favorites

import android.util.Log
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
    private val applicationScope: CoroutineScope, // Inyectado desde RemoteModule (Singleton)
    private val loadingManager: com.gamesage.kotlin.utils.LoadingManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<FavoritesUiState>(FavoritesUiState.Initial)
    val uiState: StateFlow<FavoritesUiState> = _uiState.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        loadFavorites()
    }

    private fun loadFavorites(showLoading: Boolean = true) {
        viewModelScope.launch {
            if (showLoading) {
                _uiState.value = FavoritesUiState.Loading
            }
            val result = favoritesRepository.readAll()
            result.onSuccess { games ->
                _uiState.value = FavoritesUiState.Success(
                    games = games.map { it.asFavoriteItemUiState() }
                )
            }.onFailure { e ->
                Log.e("FavoritesVM", "loadFavorites FAILED: ${e.javaClass.simpleName} - ${e.message}")
                _uiState.value = FavoritesUiState.Error(e.message ?: "Error al cargar favoritos")
            }
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun removeFromFavorites(gameId: Int, platformId: Int) {
        // Usar applicationScope para que sobreviva al cambio de pantalla
        applicationScope.launch {
            loadingManager.setBlocking(true)
            val result = favoritesRepository.remove(gameId, platformId)
            if (result.isSuccess) {
                // Si seguimos en la pantalla, refrescar (silent para evitar flash)
                if (uiState.value is FavoritesUiState.Success) {
                    loadFavorites(showLoading = false)
                }
            } else {
                val e = result.exceptionOrNull()
                Log.e("FavoritesVM", "Background remove FAILED: ${e?.message}")
                // Si falla, mostramos el error (solo si seguimos en la pantalla)
                _errorMessage.value = "Error al eliminar de favoritos"
                loadFavorites()
            }
            loadingManager.setBlocking(false)
        }
    }

    fun addToCart(game: FavoriteItemUiState) {
        // Usar applicationScope para garantizar persistencia aunque el usuario salga de la pantalla
        applicationScope.launch {
            loadingManager.setBlocking(true)
            Log.d("FavoritesVM", "Starting BACKGROUND transfer for game ${game.gameId}")
            val addResult = cartRepository.add(game.gameId, game.platformId, 1)
            if (addResult.isSuccess) {
                Log.d("FavoritesVM", "Add to cart success, removing from favorites...")
                val removeResult = favoritesRepository.remove(game.gameId, game.platformId)
                if (removeResult.isSuccess) {
                    Log.d("FavoritesVM", "Transfer COMPLETE for game ${game.gameId}")
                    // Refrescar si el usuario sigue aquí (silent para evitar flash)
                    loadFavorites(showLoading = false)
                } else {
                    Log.e("FavoritesVM", "Background remove FAILED after successful add")
                    loadFavorites(showLoading = false)
                }
            } else {
                // Si falla, mostramos mensaje (solo si seguimos en la pantalla)
                if (_uiState.value is FavoritesUiState.Success) {
                    _errorMessage.value = "Error al añadir al carrito"
                }
                loadFavorites(showLoading = false)
            }
            loadingManager.setBlocking(false)
        }
    }

    fun transferAllToCart() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            val gamesToTransfer = currentState.games
            
            applicationScope.launch {
                loadingManager.setBlocking(true)
                var hasError = false
                val jobs = gamesToTransfer.map { game ->
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
                if (hasError && _uiState.value is FavoritesUiState.Success) {
                    _errorMessage.value = "Algunos juegos no pudieron transferirse"
                }
                loadFavorites(showLoading = false)
                loadingManager.setBlocking(false)
            }
        }
    }

    fun clearFavorites() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            val gamesToDelete = currentState.games
            
            applicationScope.launch {
                loadingManager.setBlocking(true)
                val jobs = gamesToDelete.map { game ->
                    async {
                        favoritesRepository.remove(game.gameId, game.platformId)
                    }
                }
                jobs.awaitAll()
                loadFavorites(showLoading = false)
                loadingManager.setBlocking(false)
            }
        }
    }
}

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