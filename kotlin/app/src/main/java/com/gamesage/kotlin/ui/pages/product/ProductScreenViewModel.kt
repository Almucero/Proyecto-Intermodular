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
import kotlinx.coroutines.delay
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
        val navigateToLogin: Boolean = false,  // Flag que indica si hay que navegar al Login
        val addedToCartSuccess: Boolean = false,   // Flag temporal de confirmación al añadir al carrito
        val addedToFavoritesSuccess: Boolean = false, // Flag temporal de confirmación al añadir a favoritos
        val error: String? = null  // Mensaje de error temporal para mostrar en la UI
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

    // Mapa que asocia el nombre de cada plataforma con su icono (drawable)
    private val platformImages: Map<String, Int> = mapOf(
        "PC" to R.drawable.pc,
        "PS5" to R.drawable.ps5,
        "Xbox Series X" to R.drawable.xbox_series_x,
        "Switch" to R.drawable.nintendo_switch,
        "PS4" to R.drawable.ps4,
        "Xbox One" to R.drawable.xbox_one
    )

    // Devuelve el stock disponible del juego para la plataforma indicada
    fun getStockForPlatform(game: Game, platformName: String?): Int {
        return when (platformName) {
            "PC" -> game.stockPc ?: 0
            "PS5" -> game.stockPs5 ?: 0
            "Xbox Series X" -> game.stockXboxX ?: 0
            "Switch" -> game.stockSwitch ?: 0
            "PS4" -> game.stockPs4 ?: 0
            "Xbox One" -> game.stockXboxOne ?: 0
            else -> {
                // Si no hay plataforma seleccionada, devuelve el stock total sumando todas las plataformas
                (game.stockPc ?: 0) + 
                (game.stockPs5 ?: 0) + 
                (game.stockXboxX ?: 0) + 
                (game.stockSwitch ?: 0) + 
                (game.stockPs4 ?: 0) + 
                (game.stockXboxOne ?: 0)
            }
        }
    }

    // Carga los datos del juego desde el repositorio usando su ID
    fun loadGame(gameId: Long) {
        viewModelScope.launch {
            // Muestra el estado de carga mientras esperamos la respuesta
            _uiState.value = ProductUiState.Loading
            
            gameRepository.readOne(gameId).fold(
                onSuccess = { game ->
                    // Construye la lista de fotos y vídeos del juego para el carrusel de la pantalla
                    buildMediaItems(game)
                    // Si el juego solo tiene una plataforma, la seleccionamos automáticamente
                    val selectedPlatform = if (game.platforms?.size == 1) {
                        game.platforms.firstOrNull()?.name
                    } else null
                    
                    _uiState.value = ProductUiState.Success(
                        game = game,
                        selectedPlatform = selectedPlatform
                    )
                },
                onFailure = {
                    // Si algo falla (sin red, juego no encontrado), mostramos el estado de error
                    _uiState.value = ProductUiState.Error
                }
            )
        }
    }

    // Construye la lista interna de MediaItems (vídeo + portada) para el carrusel
    private fun buildMediaItems(game: Game) {
        val items = mutableListOf<MediaItem>()

        // Si el juego tiene vídeo de YouTube,genera su miniatura
        game.videoUrl?.let { videoUrl ->
            val videoId = getVideoId(videoUrl)
            val thumbnailUrl = videoId?.let {
                "https://img.youtube.com/vi/$it/maxresdefault.jpg"
            }
            items.add(
                MediaItem(
                    type = MediaType.VIDEO,
                    label = "Video",
                    url = videoUrl,
                    thumbnail = thumbnailUrl
                )
            )
        }
        // Busca la imagen de tipo "cover" en las fotos del juego y la añade al carrusel
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

    // Marca la plataforma seleccionada por el usuario. Si ya estaba seleccionada y hay más opciones, la deselecciona.
    fun selectPlatform(platformName: String) {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            val availablePlatforms = currentState.game.platforms?.size ?: 0
            // Si el usuario pulsa la misma plataforma que ya tenía y hay más de una, la quita (toggle)
            val newPlatform = if (currentState.selectedPlatform == platformName && availablePlatforms > 1) {
                null
            } else {
                platformName
            }
            _uiState.value = currentState.copy(selectedPlatform = newPlatform)
        }
    }

    // Comprueba si una plataforma concreta está disponible para el juego actual
    fun isPlatformAvailable(platformName: String): Boolean {
        val currentState = _uiState.value
        return if (currentState is ProductUiState.Success) {
            currentState.game.platforms?.any { it.name == platformName } ?: false
        } else {
            false
        }
    }

    // Retrocede al elemento anterior del carrusel de media (foto/vídeo)
    fun previousMedia() {
        val currentState = _uiState.value
        // Solo retrocede si hay elementos anteriores (no estamos ya en el primero)
        if (currentState is ProductUiState.Success && currentState.currentMediaIndex > 0) {
            _uiState.value = currentState.copy(
                currentMediaIndex = currentState.currentMediaIndex - 1
            )
        }
    }

    // Avanza al siguiente elemento del carrusel de media (foto/vídeo)
    fun nextMedia() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            val maxIndex = _mediaItems.value.size - 1
            // Solo avanza si hay más elementos (no estamos ya en el último)
            if (currentState.currentMediaIndex < maxIndex) {
                _uiState.value = currentState.copy(
                    currentMediaIndex = currentState.currentMediaIndex + 1
                )
            }
        }
    }

    // Salta directamente a un elemento concreto del carrusel al pulsar su miniatura
    fun selectMedia(index: Int) {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(currentMediaIndex = index)
        }
    }

    // Añade el juego al carrito del usuario
    fun addToCart() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            viewModelScope.launch {
                // Comprueba si el usuario tiene sesión iniciada (si tiene token guardado)
                val token = tokenManager.token.firstOrNull()
                if (token.isNullOrBlank()) {
                    // Sin token → redirige al Login (activa el flag navigateToLogin)
                    _uiState.value = currentState.copy(navigateToLogin = true)
                    return@launch
                }

                // Si no ha seleccionado plataforma, muestra un error temporal de 2 segundos
                if (currentState.selectedPlatform == null) {
                     _uiState.value = currentState.copy(error = "Selecciona una plataforma")
                     delay(2000)
                     val state = _uiState.value
                     if (state is ProductUiState.Success) {
                         _uiState.value = state.copy(error = null)
                     }
                     return@launch
                }

                // Busca el ID de la plataforma seleccionada dentro de las plataformas del juego
                val platform = currentState.game.platforms?.find { it.name == currentState.selectedPlatform }
                val platformId = platform?.id

                if (platformId == null) {
                    _uiState.value = currentState.copy(error = "Error: Plataforma no encontrada")
                    return@launch
                }

                // Llama al repositorio para añadir el juego al carrito con cantidad 1
                cartRepository.add(currentState.game.id, platformId, 1).fold(
                    onSuccess = {
                        // Muestra un mensaje de éxito temporal durante 2 segundos
                        _uiState.value = currentState.copy(addedToCartSuccess = true, error = null)
                        delay(2000)
                        val state = _uiState.value
                        if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(addedToCartSuccess = false)
                        }
                    },
                    onFailure = { e ->
                        e.printStackTrace()
                        // Muestra el error durante 3 segundos y luego lo limpia
                        _uiState.value = currentState.copy(error = "Error al añadir al carrito: ${e.message}")
                        delay(3000)
                        val state = _uiState.value
                        if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(error = null)
                        }
                    }
                )
            }
        }
    }

    // Limpia el mensaje de error actual del estado
    fun clearError() {
         val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(error = null)
        }
    }

    // Añade el juego a la lista de favoritos del usuario
    fun addToFavorites() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            viewModelScope.launch {
                // Comprueba si el usuario tiene sesión iniciada (si tiene token guardado)
                val token = tokenManager.token.firstOrNull()
                if (token.isNullOrBlank()) {
                    // Sin token → redirige al Login (activa el flag navigateToLogin)
                    _uiState.value = currentState.copy(navigateToLogin = true)
                    return@launch
                }

                // Si no ha seleccionado plataforma, muestra un error temporal de 2 segundos
                if (currentState.selectedPlatform == null) {
                    _uiState.value = currentState.copy(error = "Selecciona una plataforma")
                     delay(2000)
                     val state = _uiState.value
                     if (state is ProductUiState.Success) {
                         _uiState.value = state.copy(error = null)
                     }
                    return@launch
                }
                
                // Busca el ID de la plataforma seleccionada
                val platform = currentState.game.platforms?.find { it.name == currentState.selectedPlatform }
                val platformId = platform?.id ?: return@launch

                // Llama al repositorio para añadir el juego a favoritos
                favoritesRepository.add(currentState.game.id, platformId).fold(
                    onSuccess = {
                        // Muestra confirmación visual de éxito durante 2 segundos
                        _uiState.value = currentState.copy(addedToFavoritesSuccess = true)
                        delay(2000)
                        val state = _uiState.value
                         if (state is ProductUiState.Success) {
                            _uiState.value = state.copy(addedToFavoritesSuccess = false)
                        }
                    },
                    onFailure = { e ->
                        // Error 409 significa que el juego ya estaba en favoritos para esa plataforma
                        val errorMsg = if (e is retrofit2.HttpException && e.code() == 409) {
                            "Este juego ya está en favoritos para esta plataforma"
                        } else {
                            "Error al añadir a favoritos: ${e.message}"
                        }
                        _uiState.value = currentState.copy(error = errorMsg)
                         delay(2000)
                         val state = _uiState.value
                         if (state is ProductUiState.Success) {
                             _uiState.value = state.copy(error = null)
                         }
                    }
                )
            }
        }
    }

    // Comprar ahora: reutiliza la lógica de añadir al carrito
    fun buyNow() {
        addToCart()
    }

    // Se llama desde la UI después de que se haya procesado la navegación al Login,
    // para evitar que se vuelva a navegar al Login de forma involuntaria
    fun onNavigationConsumed() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            _uiState.value = currentState.copy(navigateToLogin = false)
        }
    }

    // Reintenta cargar el juego si hubo un error anterior
    fun retry() {
        val currentState = _uiState.value
        if (currentState is ProductUiState.Success) {
            loadGame(currentState.game.id.toLong())
        }
    }

    // Devuelve el número de estrellas llenas basándose en el rating (truncado a entero)
    fun getRatingStars(rating: Float?): Int {
        return (rating ?: 0f).toInt()
    }

    // Devuelve el número de estrellas vacías (hasta completar 5 estrellas en total)
    fun getEmptyStars(rating: Float?): Int {
        val fullStars = (rating ?: 0f).toInt()
        return 5 - fullStars
    }

    // Devuelve la lista de todas las plataformas con su disponibilidad y stock,
    // ordenadas para que aparezcan primero las que están disponibles
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
        }.sortedByDescending { it.isAvailable } // Las plataformas disponibles van primero
    }

    // Extrae el ID del vídeo de YouTube desde la URL completa (parámetro "v=")
    private fun getVideoId(url: String): String? {
        val regex = "[?&]v=([^&]+)".toRegex()
        return regex.find(url)?.groupValues?.get(1)
    }

    // Busca y devuelve la URL de la primera captura de pantalla del juego
    fun getScreenshot1(): String? {
        val currentState = _uiState.value
        if (currentState !is ProductUiState.Success) return null
        
        return currentState.game.media?.find {
            it.altText?.lowercase()?.contains("screenshot1") == true ||
            it.altText?.lowercase()?.contains("screenshot 1") == true
        }?.url
    }

    // Busca y devuelve la URL de la segunda captura de pantalla del juego
    fun getScreenshot2(): String? {
        val currentState = _uiState.value
        if (currentState !is ProductUiState.Success) return null
        
        return currentState.game.media?.find {
            it.altText?.lowercase()?.contains("screenshot2") == true ||
            it.altText?.lowercase()?.contains("screenshot 2") == true
        }?.url
    }
}

// Clase que agrupa la información de una plataforma para mostrarla en la UI
data class PlatformInfo(
    val name: String,
    val image: Int,
    val isAvailable: Boolean,
    val stock: Int = 0
)