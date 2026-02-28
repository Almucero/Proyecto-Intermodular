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

// Modelo que usa la UI para mostrar cada favorito
// No es el modelo de base de datos, es una versión adaptada para mostrar en pantalla
data class FavoriteItemUiState(
    val gameId: Int,
    val title: String,
    val developerName: String,
    val platformId: Int,
    val platformName: String,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val imageUrl: String
)

//Estados de pantalla
sealed class FavoritesUiState {
    object Initial : FavoritesUiState()
    object Loading : FavoritesUiState()
    data class Success(val games: List<FavoriteItemUiState>) : FavoritesUiState()
    data class Error(val message: String) : FavoritesUiState()
}

// Se comunica con FavoritesRepository y CartRepository
@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val favoritesRepository: FavoritesRepository,
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<FavoritesUiState>(FavoritesUiState.Initial)
    val uiState: StateFlow<FavoritesUiState> = _uiState.asStateFlow()

    // Para mostrar mensajes de error temporales (tipo Snackbar)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Cuando se crea el ViewModel, automáticamente observa los favoritos.
    init {
        observeFavorites()
    }

    // Observa los favoritos y actualiza el estado de la UI
    private fun observeFavorites() {
        viewModelScope.launch {
            //El estado se muestra en loading mientras se obtiene la información de favoritos
            _uiState.value = FavoritesUiState.Loading
            //Se observa el flujo de datos desde el repositorio de favoritos
            favoritesRepository.observe().collect { result ->
                //Si la lista de juegos favoritos (games) se obtiene correctamente, el estado de la UI se actualiza a FavoritesUiState.Success
                result.onSuccess { games ->
                    _uiState.value = FavoritesUiState.Success(
                        //se asignan los juegos mapeados a un formato adecuado para la UI
                        games = games.map { it.asFavoriteItemUiState() }
                    )
                    //Se ejecuta si el resultado es un error
                }.onFailure { e ->
                    _uiState.value = FavoritesUiState.Error(e.message ?: "Error al cargar favoritos")
                }
            }
        }
    }

    // Limpia el mensaje de error después de mostrarlo
    fun clearError() {
        _errorMessage.value = null
    }

    // Elimina un juego de la lista de favoritos.
    fun removeFromFavorites(gameId: Int, platformId: Int) {
        viewModelScope.launch {
            favoritesRepository.remove(gameId, platformId)
                .onFailure {
                    _errorMessage.value = "Error al eliminar: se necesita conexión a internet"
                }
        }
    }

    // Añade un juego al carrito y lo elimina de favoritos.
    fun addToCart(game: FavoriteItemUiState) {
        viewModelScope.launch {
            cartRepository.add(game.gameId, game.platformId, 1) 
                .onSuccess {
                    favoritesRepository.remove(game.gameId, game.platformId)
                }
                .onFailure {
                    _errorMessage.value = "Error al añadir al carrito: se necesita conexión a internet"
                }
        }
    }

    // Transfiere todos los favoritos al carrito.
    fun transferAllToCart() {
        val currentState = _uiState.value
        if (currentState is FavoritesUiState.Success) {
            viewModelScope.launch {
                currentState.games.forEach { game ->
                    cartRepository.add(game.gameId, game.platformId, 1)
                        .onSuccess {
                            favoritesRepository.remove(game.gameId, game.platformId)
                        }
                        .onFailure {
                            _errorMessage.value = "Error al transferir productos: se necesita conexión a internet"
                        }
                }
            }
        }
    }
}

// Convierte el modelo de base de datos en modelo para UI.
fun Game.asFavoriteItemUiState(): FavoriteItemUiState {
    return FavoriteItemUiState(
        gameId = this.id,
        title = this.title,
        developerName = this.Developer?.name ?: "Desconocido",
        platformId = this.platforms?.firstOrNull()?.id ?: 0,
        platformName = this.platforms?.firstOrNull()?.name ?: "Múltiple",
        price = this.price,
        isOnSale = this.isOnSale,
        salePrice = this.salePrice,
        imageUrl = this.media?.firstOrNull()?.url ?: "https://via.placeholder.com/600x400"
    )
}