package com.gamesage.kotlin.ui.pages.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.repository.chat.ChatRepository
import com.gamesage.kotlin.data.repository.user.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import javax.inject.Inject

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val sessionId: Int? = null,
    val sessions: List<ChatSession> = emptyList(),
    val userAvatar: String? = null
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init {
        fetchSessions()
        viewModelScope.launch {
            userRepository.observeMe().collect { result ->
                result.onSuccess { user ->
                    _uiState.value = _uiState.value.copy(userAvatar = user.avatar)
                }
            }
        }
    }

    fun fetchSessions() {
        viewModelScope.launch {
            val result = chatRepository.getSessions()
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(sessions = result.getOrNull() ?: emptyList())
            }
        }
    }

    fun setSessionId(sessionId: Int?) {
        if (sessionId != null && sessionId != -1) {
            _uiState.value = _uiState.value.copy(sessionId = sessionId)
            loadSession(sessionId)
        } else {
            _uiState.value = _uiState.value.copy(sessionId = null, messages = emptyList())
        }
    }

    private fun loadSession(id: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = chatRepository.getSession(id)
            if (result.isSuccess) {
                val session = result.getOrNull()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    messages = session?.messages ?: emptyList()
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Failed to load session"
                )
            }
        }
    }

    // Corregido: Referencia a sessionId y lógica de respuesta automática por error de red
    fun sendMessage(content: String, errorReplyText: String) {
        if (content.isBlank()) return

        // Usamos el sessionId del estado actual de la UI para evitar errores de referencia
        val currentId = _uiState.value.sessionId

        val newUserMessage = ChatMessage(
            id = null,
            sessionId = currentId ?: 0,
            role = "user",
            content = content,
            createdAt = LocalDateTime.now(),
            games = null
        )

        val updatedMessages = _uiState.value.messages + newUserMessage
        _uiState.value = _uiState.value.copy(messages = updatedMessages, isLoading = true, error = null)

        viewModelScope.launch {
            val request = SendMessageRequest(
                message = content,
                sessionId = currentId
            )
            val result = chatRepository.sendMessage(request)

            result.onSuccess { assistantMessage ->
                val finalMessages = _uiState.value.messages + assistantMessage
                _uiState.value = _uiState.value.copy(
                    messages = finalMessages,
                    isLoading = false,
                    sessionId = assistantMessage.sessionId
                )
            }.onFailure { e ->
                // Si el error es de conexión (IOException), añadimos un mensaje de Sage automático
                if (e is java.io.IOException) {
                    delay(1500)
                    val autoReply = ChatMessage(
                        id = null,
                        sessionId = currentId ?: 0,
                        role = "assistant",
                        content = errorReplyText, // El texto traducido que viene de la UI
                        createdAt = LocalDateTime.now(),
                        games = null
                    )
                    _uiState.value = _uiState.value.copy(
                        messages = _uiState.value.messages + autoReply,
                        isLoading = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.message ?: "Error"
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}