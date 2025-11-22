package com.gamesage.kotlin.ui.pages.aiChat

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel

@Composable
fun AiChatScreen(
    modifier: Modifier = Modifier,
    viewModel: AiChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    when (uiState) {
        UiState.Error -> TODO()
        UiState.Initial -> TODO()
        UiState.Loading -> TODO()
    }
    //TODO Toda la pantalla
}