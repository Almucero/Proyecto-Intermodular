package com.gamesage.kotlin.ui.pages.aichat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.data.remote.model.ChatMessageApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.repository.chat.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AIChatUiState(
    val messages: List<ChatMessageApiModel> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val currentSessionId: Int? = null
)

@HiltViewModel
class AIChatViewModel @Inject constructor(
    private val tokenManager: TokenManager,
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AIChatUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadChatHistory()
    }

    private fun loadChatHistory() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val sessions = chatRepository.getSessions()
                if (sessions.isNotEmpty()) {
                    val lastSession = chatRepository.getSession(sessions.first().id)
                    _uiState.update { 
                        it.copy(
                            messages = lastSession.messages ?: emptyList(),
                            currentSessionId = lastSession.id,
                            isLoading = false
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.localizedMessage) }
            }
        }
    }

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        viewModelScope.launch {
            val userMessage = ChatMessageApiModel(role = "user", content = text)
            _uiState.update { it.copy(messages = it.messages + userMessage) }

            try {
                val response = chatRepository.sendMessage(
                    SendMessageRequest(
                        message = text,
                        sessionId = _uiState.value.currentSessionId
                    )
                )

                val assistantMessage = ChatMessageApiModel(
                    role = "assistant",
                    content = response.text,
                    games = response.games
                )
                
                _uiState.update { 
                    it.copy(
                        messages = it.messages + assistantMessage,
                        currentSessionId = response.sessionId
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Error al enviar mensaje: ${e.localizedMessage}") }
            }
        }
    }

    suspend fun getToken(): String? {
        return tokenManager.token.firstOrNull()
    }
}
