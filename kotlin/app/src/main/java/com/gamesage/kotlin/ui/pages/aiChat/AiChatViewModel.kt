package com.gamesage.kotlin.ui.pages.aiChat

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AiChatViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val repository: GameSageRepository
): ViewModel() {
    private val _uiState: MutableStateFlow<UiState > =
        MutableStateFlow(value = UiState.Initial)

    val uiState: StateFlow<UiState>
        get() = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
        }
    }
}

sealed class UiState {
    object Initial: UiState()
    object Loading: UiState()
    object Error: UiState()
//    data class Success(poner cositas por aqui): UiState()
}

//TODO todo lo demas