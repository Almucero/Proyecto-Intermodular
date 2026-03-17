package com.gamesage.kotlin.ui.pages.search

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.game.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import jakarta.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Representa los posibles estados de la pantalla de búsqueda
sealed class SearchUiState {
    object Loading : SearchUiState() // Estado mientras se cargan los juegos
    object Error : SearchUiState()   // Estado si falla la conexión o la carga
    data class Success(val games: List<Game>) : SearchUiState() // Estado con la lista de juegos filtrados
}

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    // Estado principal de la UI (Cargando, Error o Éxito con la lista de juegos)
    private val _uiState = MutableStateFlow<SearchUiState>(SearchUiState.Loading)
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    // Copia de todos los juegos para aplicar filtros sin perder los datos originales
    private val _allGames = MutableStateFlow<List<Game>>(emptyList())
    
    // Filtro de rango de precio seleccionado
    private val _selectedPrice = MutableStateFlow("")
    val selectedPrice: StateFlow<String> = _selectedPrice.asStateFlow()
    
    // Filtro de géneros seleccionados
    private val _selectedGenre = MutableStateFlow<Set<String>>(emptySet())
    val selectedGenre: StateFlow<Set<String>> = _selectedGenre.asStateFlow()
    
    // Filtro de plataforma seleccionada
    private val _selectedPlatform = MutableStateFlow("")
    val selectedPlatform: StateFlow<String> = _selectedPlatform.asStateFlow()

    // Consulta de texto escrita en la barra de búsqueda
    private val _searchQuery = MutableStateFlow(savedStateHandle.get<String>("query") ?: "")

    // Valor actual del slider de precio
    private val _priceValue = MutableStateFlow(100)
    val priceValue: StateFlow<Int> = _priceValue.asStateFlow()
    
    // Precio máximo detectado entre todos los juegos para ajustar el slider automáticamente (100 es valor por defecto antes de que carguen datos reales)
    private val _maxPrice = MutableStateFlow(100)
    val maxPrice: StateFlow<Int> = _maxPrice.asStateFlow()

    // Lista de géneros del back
    val availableGenres = MutableStateFlow(listOf(
        "Accion", "Aventura", "RPG", "Deportes", "Estrategia", "Simulacion", "Terror",
        "Carreras", "Plataformas", "Puzzles", "Lucha", "Musicales", "Acción-Aventura",
        "Shooter", "MOBA", "Roguelike", "Sandbox", "MMORPG", "Battle Royale",
        "Survival Horror", "Metroidvania", "RTS", "TBS", "Hack and Slash", "Beat 'Em Up",
        "Novela Visual", "CCG", "FPS", "Táctico", "Ciencia Ficción", "Educativo",
        "Gestión", "Construcción de Ciudades", "Exploración", "Supervivencia",
        "Horror Psicológico", "Stealth", "Cinemático", "Narrativa", "Cooperativo",
        "Arcade", "Mundo Abierto", "Off-Road", "Simcade"
    )).asStateFlow()

    // Lista de plataformas del back
    val availablePlatforms = MutableStateFlow(listOf(
        "PC", "PS5", "Xbox Series X", "Switch", "PS4", "Xbox One"
    )).asStateFlow()


    // Lista de opciones de filtrado por precio disponibles
    val priceOptions = listOf(
        PriceOption("free", R.string.price_free),
        PriceOption("0-10", labelText = "0-10€"),
        PriceOption("10-20", labelText = "10-20€"),
        PriceOption("20-40", labelText = "20-40€"),
        PriceOption("40+", labelText = "40€+")
    )

    init {
        // Si se viene desde home al seleccionar un genero, se aplica
        val genreArg = savedStateHandle.get<String>("genre")
        if (!genreArg.isNullOrEmpty()) {
            _selectedGenre.value = setOf(genreArg)
        }
        loadGames() // Carga inicial de juegos
    }

    // Pide todos los juegos al repositorio y calcula el precio máximo para el slider
    private fun loadGames() {
        viewModelScope.launch {
            _uiState.value = SearchUiState.Loading
            gameRepository.readAll().fold(
                onSuccess = { games ->
                    _allGames.value = games
                    // Calcula el precio más alto (considerando ofertas) para configurar el rango del slider
                    val max = games.maxOfOrNull { 
                        if (it.isOnSale && it.salePrice != null) it.salePrice else it.price ?: 0.0
                    }?.toInt() ?: 100
                    // Redondea el máximo hacia arriba a la decena más cercana (ej.: 53 -> 60)
                    _maxPrice.value = ((max / 10) + 1) * 10
                    _priceValue.value = _maxPrice.value
                    
                    applyFilters() // Aplica filtros iniciales (incluyendo búsqueda o género si venían por argumento)
                },
                onFailure = {
                    _uiState.value = SearchUiState.Error
                }
            )
        }
    }

    // Actualiza el filtro de rango de precio predefinido
    fun selectPrice(price: String) {
        _selectedPrice.value = price
        applyFilters()
    }

    // Añade o quita un género de la selección actual (multiselección)
    fun selectGenre(genre: String) {
        val current = _selectedGenre.value.toMutableSet()
        if (current.contains(genre)) {
            current.remove(genre)
        } else {
            current.add(genre)
        }
        _selectedGenre.value = current
        applyFilters()
    }

    // Selecciona una plataforma (si ya estaba seleccionada, la desmarca)
    fun selectPlatform(platform: String) {
        _selectedPlatform.value = if (_selectedPlatform.value == platform) "" else platform
        applyFilters()
    }

    // Actualiza los filtros cuando el usuario mueve el slider de precio
    fun updatePriceSlider(value: Int) {
        _priceValue.value = value
    }

    fun onPriceSliderFinished() {
        _selectedPrice.value = "0-${_priceValue.value}"
        applyFilters()
    }

    // Limpia todos los filtros y la búsqueda para volver al estado inicial
    fun resetFilters() {
        _selectedPrice.value = ""
        _selectedGenre.value = emptySet()
        _selectedPlatform.value = ""
        _searchQuery.value = ""
        _priceValue.value = _maxPrice.value
        applyFilters()
    }

    // Elimina un filtro específico (usado desde los chips de filtros activos)
    fun removeFilter(type: String) {
        when {
            type == "price" -> {
                _selectedPrice.value = ""
                _priceValue.value = _maxPrice.value
            }
            type.startsWith("genre:") -> {
                val genreToRemove = type.removePrefix("genre:")
                val current = _selectedGenre.value.toMutableSet()
                current.remove(genreToRemove)
                _selectedGenre.value = current
            }
            type == "genre" -> _selectedGenre.value = emptySet()
            type == "platform" -> _selectedPlatform.value = ""
        }
        applyFilters()
    }

    // Combina todos los filtros activos y actualiza la lista que ve el usuario
    private fun applyFilters() {
        var filtered = _allGames.value

        // 1. Filtrar por texto de búsqueda
        if (_searchQuery.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.title.contains(_searchQuery.value, ignoreCase = true)
            }
        }
        // 2. Filtrar por rango o slider de precio
        if (_selectedPrice.value.isNotEmpty()) {
            filtered = filterByPrice(filtered, _selectedPrice.value)
        }
        // 3. Filtrar por géneros (el juego debe tener AL MENOS UNO(Or) de los seleccionados)
        if (_selectedGenre.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.genres?.any { genre -> 
                    _selectedGenre.value.any { selected -> genre.name.equals(selected, ignoreCase = true) }
                } == true
            }
        }
        // 4. Filtrar por plataforma
        if (_selectedPlatform.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.platforms?.any { it.name.contains(_selectedPlatform.value, ignoreCase = true) } == true
            }
        }
        // Actualizamos el estado con el resultado final
        _uiState.value = SearchUiState.Success(filtered)
    }

    // Lógica para filtrar la lista basándose en cadenas de tipo "free", "40+" o rangos "X-Y"
    private fun filterByPrice(games: List<Game>, priceRange: String): List<Game> {
        return when {
            priceRange == "free" -> games.filter { (it.price ?: 0.0) == 0.0 }
            priceRange == "40+" -> games.filter { (it.price ?: 0.0) >= 40 }
            priceRange.contains("-") -> {
                val (min, max) = priceRange.split("-").map { it.toIntOrNull() ?: 0 }
                games.filter {
                    // Se chequea el precio de oferta si existe
                    val price = if (it.isOnSale && it.salePrice != null) it.salePrice else it.price ?: 0.0
                    price >= min && price <= max
                }
            }
            else -> games
        }
    }

    // Genera una lista de objetos para mostrar los chips de filtros aplicados en la UI
    fun getActiveFilters(): List<ActiveFilter> {
        val filters = mutableListOf<ActiveFilter>()
        
        // Formatea la etiqueta del precio para que sea legible usando la lista
        if (_selectedPrice.value.isNotEmpty()) {
            val option = priceOptions.find { it.value == _selectedPrice.value }
            val label = when {
                option != null -> option.labelText ?: "Gratis" // Si existe en la lista, se usa su texto (o "Gratis" para el recurso)
                else -> "Max: ${_priceValue.value}€"           // Si no está, es que viene del slider
            }
            filters.add(ActiveFilter("price", label))
        }
        
        // Genera un chip por cada género seleccionado
        if (_selectedGenre.value.isNotEmpty()) {
            _selectedGenre.value.forEach { genre ->
                filters.add(ActiveFilter("genre:$genre", genre))
            }
        }
        // Chip de plataforma
        if (_selectedPlatform.value.isNotEmpty()) {
            filters.add(ActiveFilter("platform", _selectedPlatform.value))
        }
        return filters
    }
}

// Opción de filtrado por precio
data class PriceOption(
    val value: String,            // Valor de filtro (ej: "free", "0-10")
    val labelResId: Int? = null,  // ID del recurso de texto si es traducible
    val labelText: String? = null // Texto directo si no necesita traducción
)

// Filtro activo para ser mostrado en la interfaz
data class ActiveFilter(
    val type: String,  // Identificador del tipo (price, genre:Action, etc.)
    val label: String  // Texto que verá el usuario (ej.: "Acción", "Gratis")
)

