package com.gamesage.kotlin.ui.pages.product

import com.gamesage.kotlin.R
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.local.TokenManager
import kotlinx.coroutines.flow.firstOrNull
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.cart.CartRepository
import com.gamesage.kotlin.data.repository.favorites.FavoritesRepository
import com.gamesage.kotlin.data.repository.game.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class ProductUiState {
    object Initial : ProductUiState()
    object Loading : ProductUiState()
    data class Success(
        val game: Game,
        val selectedPlatform: String? = null,
        val currentMediaIndex: Int = 0,
        val showAuthModal: Boolean = false,
        val addedToCartSuccess: Boolean = false,
        val addedToFavoritesSuccess: Boolean = false,
        val error: String? = null
    ) : ProductUiState()
    object Error : ProductUiState()
}

data class MediaItem(
    val type: MediaType,
    val label: String,
    val url: String,
    val thumbnail: String? = null
)

enum class MediaType {
    VIDEO, IMAGE
}

@HiltViewModel
class ProductScreenViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val cartRepository: CartRepository,
    private val favoritesRepository: FavoritesRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Initial)
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    private val _mediaItems = MutableStateFlow<List<MediaItem>>(emptyList())
    val mediaItems: StateFlow<List<MediaItem>> = _mediaItems.asStateFlow()

    private val platformImages: Map<String, Int> = mapOf(
        "PC" to R.drawable.pc,
        "PS5" to R.drawable.ps5,
        "Xbox Series X" to R.drawable.xbox_series_x,
        "Switch" to R.drawable.nintendo_switch,
        "PS4" to R.drawable.ps4,
        "Xbox One" to R.drawable.xbox_one
    )

    fun getStockForPlatform(game: Game, platformName: String?): Int {
        return when (platformName) {
            "PC" -> game.stockPc ?: 0
            "PS5" -> game.stockPs5 ?: 0
            "Xbox Series X" -> game.stockXboxX ?: 0
            "Switch" -> game.stockSwitch ?: 0
            "PS4" -> game.stockPs4 ?: 0
            "Xbox One" -> game.stockXboxOne ?: 0
            else -> {
                (game.stockPc ?: 0) + 
                (game.stockPs5 ?: 0) + 
                (game.stockXboxX ?: 0) + 
                (game.stockSwitch ?: 0) + 
                (game.stockPs4 ?: 0) + 
                (game.stockXboxOne ?: 0)
            }
        }
    }

    fun loadGame(gameId: Long) {
        viewModelScope.launch {
            _uiState.value = ProductUiState.Loading
            
            gameRepository.readOne(gameId).fold(
                onSuccess = { game ->
                    buildMediaItems(game)
                    val selectedPlatform = if (game.platforms?.size == 1) {
                        game.platforms.firstOrNull()?.name
                    } else null
                    
                    _uiState.value = ProductUiState.Success(
                        game = game,
                        selectedPlatform = selectedPlatform
                    )
                },
                onFailure = {
                    _uiState.value = ProductUiState.Error
                }
            )
        }
    }

    private fun buildMediaItems(game: Game) {
        val items = mutableListOf<MediaItem>()

        game.videoUrl?.let { videoUrl ->
            val videoId = getVideoId(videoUrl)
            val embedUrl = convertToEmbedUrl(videoUrl)
            val thumbnailUrl = videoId?.let {
                "https://img.youtube.com/vi/$it/maxresdefault.jpg"
            }

            items.add(
                MediaItem(
                    type = MediaType.VIDEO,
                    label = "Video",
                    url = embedUrl,
                    thumbnail = thumbnailUrl
                )
            )
        }
        game.media?.find { it.altText?.lowercase()?.contains("cover") == true }?.let { cover ->
            items.add(
                MediaItem(
                    type = MediaType.IMAGE,
                    label = "Cover",
                    url = cover.url
                )
            )
        }

        _mediaItems.value = items
    }

    fun selectPlatform(platformName: String) {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            val availablePlatforms = currentState.game.platforms?.size ?: 0
            val newPlatform = if (currentState.selectedPlatform == platformName && availablePlatforms > 1) {
                null
            } else {
                platformName
            }
            _uiState.value = currentState.copy(selectedPlatform = newPlatform)
        }
    }

    fun isPlatformAvailable(platformName: String): Boolean {
        val currentState = _uiState.value
        return if (currentState is ProductUiState.Success) {
            currentState.game.platforms?.any { it.name == platformName } ?: false
        } else {
            false
        }
    }

    fun previousMedia() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success && currentState.currentMediaIndex > 0) {
            _uiState.value = currentState.copy(
                currentMediaIndex = currentState.currentMediaIndex - 1
            )
        }
    }

    fun nextMedia() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            val maxIndex = _mediaItems.value.size - 1
            if (currentState.currentMediaIndex < maxIndex) {
                _uiState.value = currentState.copy(
                    currentMediaIndex = currentState.currentMediaIndex + 1
                )
            }
        }
    }

    fun selectMedia(index: Int) {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(currentMediaIndex = index)
        }
    }

    fun addToCart() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            viewModelScope.launch {
                val token = tokenManager.token.firstOrNull()
                if (token.isNullOrBlank()) {
                    _uiState.value = currentState.copy(showAuthModal = true)
                    return@launch
                }

                if (currentState.selectedPlatform == null) {
                     _uiState.value = currentState.copy(error = "Selecciona una plataforma")
                     kotlinx.coroutines.delay(2000)
                     val state = _uiState.value
                     if (state is ProductUiState.Success) {
                         _uiState.value = state.copy(error = null)
                     }
                     return@launch
                }

                val platform = currentState.game.platforms?.find { it.name == currentState.selectedPlatform }
                val platformId = platform?.id

                if (platformId == null) {
                    _uiState.value = currentState.copy(error = "Error: Plataforma no encontrada")
                    return@launch
                }

                cartRepository.add(currentState.game.id, platformId, 1).fold(
                    onSuccess = {
                        _uiState.value = currentState.copy(addedToCartSuccess = true, error = null)
                        kotlinx.coroutines.delay(2000)
                        val state = _uiState.value
                        if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(addedToCartSuccess = false)
                        }
                    },
                    onFailure = { e ->
                        e.printStackTrace()
                        _uiState.value = currentState.copy(error = "Error al añadir al carrito: ${e.message}")
                        kotlinx.coroutines.delay(3000)
                        val state = _uiState.value
                        if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(error = null)
                        }
                    }
                )
            }
        }
    }

    fun clearError() {
         val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(error = null)
        }
    }

    fun addToFavorites() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            viewModelScope.launch {
                val token = tokenManager.token.firstOrNull()
                if (token.isNullOrBlank()) {
                    _uiState.value = currentState.copy(showAuthModal = true)
                    return@launch
                }

                if (currentState.selectedPlatform == null) {
                    _uiState.value = currentState.copy(error = "Selecciona una plataforma")
                     kotlinx.coroutines.delay(2000)
                     val state = _uiState.value
                     if (state is ProductUiState.Success) {
                         _uiState.value = state.copy(error = null)
                     }
                    return@launch
                }
                
                val platform = currentState.game.platforms?.find { it.name == currentState.selectedPlatform }
                val platformId = platform?.id ?: return@launch

                favoritesRepository.add(currentState.game.id, platformId).fold(
                    onSuccess = {
                        _uiState.value = currentState.copy(addedToFavoritesSuccess = true)
                        kotlinx.coroutines.delay(2000)
                        val state = _uiState.value
                         if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(addedToFavoritesSuccess = false)
                        }
                    },
                    onFailure = { e ->
                        _uiState.value = currentState.copy(error = "Error al añadir a favoritos: ${e.message}")
                         kotlinx.coroutines.delay(2000)
                         val state = _uiState.value
                         if (state is ProductUiState.Success) {
                             _uiState.value = state.copy(error = null)
                         }
                    }
                )
            }
        }
    }

    fun buyNow() {
        addToCart()
    }

    fun showAuthModal(show: Boolean) {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(showAuthModal = show)
        }
    }

    fun retry() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            loadGame(currentState.game.id.toLong())
        }
    }

    fun getRatingStars(rating: Float?): Int {
        return (rating ?: 0f).toInt()
    }

    fun getEmptyStars(rating: Float?): Int {
        val fullStars = (rating ?: 0f).toInt()
        return 5 - fullStars
    }

    fun getSortedPlatforms(): List<PlatformInfo> {
        val currentState = _uiState.value
        if (currentState !is ProductUiState.Success) return emptyList()

        val allPlatforms = listOf("PC", "PS5", "Xbox Series X", "Switch", "PS4", "Xbox One")
        
        return allPlatforms.map { platformName ->
            val stock = getStockForPlatform(currentState.game, platformName)
            PlatformInfo(
                name = platformName,
                image = platformImages[platformName] ?: 0,
                isAvailable = isPlatformAvailable(platformName),
                stock = stock
            )
        }.sortedByDescending { it.isAvailable }
    }

    private fun getVideoId(url: String): String? {
        val regex = "[?&]v=([^&]+)".toRegex()
        return regex.find(url)?.groupValues?.get(1)
    }

    private fun convertToEmbedUrl(url: String): String {
        val videoId = getVideoId(url)
        return if (videoId != null) {
            "https://www.youtube.com/embed/$videoId?autoplay=1&mute=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
        } else {
            url
        }
    }

    fun getScreenshot1(): String? {
        val currentState = _uiState.value
        if (currentState !is ProductUiState.Success) return null
        
        return currentState.game.media?.find {
            it.altText?.lowercase()?.contains("screenshot1") == true ||
            it.altText?.lowercase()?.contains("screenshot 1") == true
        }?.url
    }

    fun getScreenshot2(): String? {
        val currentState = _uiState.value
        if (currentState !is ProductUiState.Success) return null
        
        return currentState.game.media?.find {
            it.altText?.lowercase()?.contains("screenshot2") == true ||
            it.altText?.lowercase()?.contains("screenshot 2") == true
        }?.url
    }
}

data class PlatformInfo(
    val name: String,
    val image: Int,
    val isAvailable: Boolean,
    val stock: Int = 0
)