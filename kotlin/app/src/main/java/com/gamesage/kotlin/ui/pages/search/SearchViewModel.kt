package com.gamesage.kotlin.ui.pages.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.repository.game.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import jakarta.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import androidx.lifecycle.SavedStateHandle
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val gameRepository: GameRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow<SearchUiState>(SearchUiState.Loading)
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    private val _allGames = MutableStateFlow<List<Game>>(emptyList())
    
    private val _selectedPrice = MutableStateFlow<String>("")
    val selectedPrice: StateFlow<String> = _selectedPrice.asStateFlow()
    
    private val _selectedGenre = MutableStateFlow<Set<String>>(emptySet())
    val selectedGenre: StateFlow<Set<String>> = _selectedGenre.asStateFlow()
    
    private val _selectedPlatform = MutableStateFlow<String>("")
    val selectedPlatform: StateFlow<String> = _selectedPlatform.asStateFlow()
    private val _searchQuery = MutableStateFlow(savedStateHandle.get<String>("query") ?: "")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _priceValue = MutableStateFlow(100)
    val priceValue: StateFlow<Int> = _priceValue.asStateFlow()
    
    private val _maxPrice = MutableStateFlow(100)
    val maxPrice: StateFlow<Int> = _maxPrice.asStateFlow()
    val availableGenres: StateFlow<List<String>> =
        _allGames
            .map { games ->
                games
                    .flatMap { it.genres ?: emptyList() }
                    .map { it.name }
                    .distinct()
                    .sorted()
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList()
            )


    init {
        val genreArg = savedStateHandle.get<String>("genre")
        if (!genreArg.isNullOrEmpty()) {
            _selectedGenre.value = setOf(genreArg)
        }
        loadGames()
    }

    private fun loadGames() {
        viewModelScope.launch {
            _uiState.value = SearchUiState.Loading
            gameRepository.readAll().fold(
                onSuccess = { games ->
                    _allGames.value = games
                    val max = games.maxOfOrNull { 
                        if (it.isOnSale && it.salePrice != null) it.salePrice!! else it.price ?: 0.0 
                    }?.toInt() ?: 100
                    _maxPrice.value = ((max / 10) + 1) * 10
                    _priceValue.value = _maxPrice.value
                    applyFilters()
                },
                onFailure = {
                    _uiState.value = SearchUiState.Error
                }
            )
        }
    }

    fun selectPrice(price: String) {
        _selectedPrice.value = price
        applyFilters()
    }

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

    fun selectPlatform(platform: String) {
        _selectedPlatform.value = if (_selectedPlatform.value == platform) "" else platform
        applyFilters()
    }

    fun updatePriceSlider(value: Int) {
        _priceValue.value = value
        _selectedPrice.value = "0-$value"
        applyFilters()
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        applyFilters()
    }

    fun resetFilters() {
        _selectedPrice.value = ""
        _selectedGenre.value = emptySet()
        _selectedPlatform.value = ""
        _searchQuery.value = ""
        _priceValue.value = _maxPrice.value
        applyFilters()
    }

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

    private fun applyFilters() {
        var filtered = _allGames.value

        if (_searchQuery.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.title.contains(_searchQuery.value, ignoreCase = true)
            }
        }

        if (_selectedPrice.value.isNotEmpty()) {
            filtered = filterByPrice(filtered, _selectedPrice.value)
        }

        if (_selectedGenre.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.genres?.any { genre -> 
                    _selectedGenre.value.any { selected -> genre.name.equals(selected, ignoreCase = true) }
                } == true
            }
        }

        if (_selectedPlatform.value.isNotEmpty()) {
            filtered = filtered.filter { game ->
                game.platforms?.any { it.name.contains(_selectedPlatform.value, ignoreCase = true) } == true
            }
        }

        _uiState.value = SearchUiState.Success(filtered)
    }

    private fun filterByPrice(games: List<Game>, priceRange: String): List<Game> {
        return when {
            priceRange == "free" -> games.filter { (it.price ?: 0.0) == 0.0 }
            priceRange == "40+" -> games.filter { (it.price ?: 0.0) >= 40 }
            priceRange.contains("-") -> {
                val (min, max) = priceRange.split("-").map { it.toIntOrNull() ?: 0 }
                games.filter {
                    val price = if (it.isOnSale && it.salePrice != null) it.salePrice!! else it.price ?: 0.0
                    price >= min && price <= max
                }
            }
            else -> games
        }
    }

    fun getActiveFilters(): List<ActiveFilter> {
        val filters = mutableListOf<ActiveFilter>()
        
        if (_selectedPrice.value.isNotEmpty()) {
            val label = when (_selectedPrice.value) {
                "free" -> "Gratis"
                "0-10" -> "0-10€"
                "10-20" -> "10-20€"
                "20-40" -> "20-40€"
                "40+" -> "40€+"
                else -> "Max: ${_priceValue.value}€"
            }
            filters.add(ActiveFilter("price", label))
        }
        
        if (_selectedGenre.value.isNotEmpty()) {
            _selectedGenre.value.forEach { genre ->
                filters.add(ActiveFilter("genre:$genre", genre))
            }
        }
        
        if (_selectedPlatform.value.isNotEmpty()) {
            filters.add(ActiveFilter("platform", _selectedPlatform.value))
        }
        
        return filters
    }
}

sealed class SearchUiState {
    object Loading : SearchUiState()
    object Error : SearchUiState()
    data class Success(val games: List<Game>) : SearchUiState()
}

data class ActiveFilter(
    val type: String,
    val label: String
)
