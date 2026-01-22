package com.gamesage.kotlin.ui.pages.home

import androidx.lifecycle.SavedStateHandle
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
import kotlinx.coroutines.launch

@HiltViewModel
class HomeScreenViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val gameRepository: GameRepository,
    private val genreRepository: GenreRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Initial)
    val uiState: StateFlow<UiState> get() = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            try {
                val genresResult = genreRepository.readAll()
                val genres = genresResult.getOrNull() ?: emptyList()
                val gamesResult = gameRepository.readAll()
                val allGames = gamesResult.getOrNull() ?: emptyList()
                val bestSellers = allGames.sortedByDescending { it.numberOfSales }.take(10)
                val offers = allGames.filter { it.isOnSale }.take(10)
                val topRated = allGames.sortedByDescending { it.rating ?: 0f }.take(10)
                val finalBestSellers = bestSellers.ifEmpty { allGames.take(10) }
                val finalOffers = offers.ifEmpty { allGames.take(10) }
                val finalTopRated = topRated.ifEmpty { allGames.take(10) }
                
                _uiState.value = UiState.Success(
                    categories = genres.map { it.name },
                    bestSellers = finalBestSellers,
                    offers = finalOffers,
                    topRated = finalTopRated
                )
                
            } catch (e: Exception) {
                e.printStackTrace()
                _uiState.value = UiState.Error
            }
        }
    }
    
    fun retry() {
        loadData()
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