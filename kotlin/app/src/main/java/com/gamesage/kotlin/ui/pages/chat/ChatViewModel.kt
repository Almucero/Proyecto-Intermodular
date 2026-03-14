package com.gamesage.kotlin.ui.pages.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.repository.chat.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
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
    val sessions: List<ChatSession> = emptyList()
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init {
        fetchSessions()
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

    fun sendMessage(content: String) {
        if (content.isBlank()) return

        val currentSessionId = _uiState.value.sessionId
        val newUserMessage = ChatMessage(
            id = null,
            sessionId = currentSessionId ?: 0, 
            role = "user",
            content = content,
            createdAt = LocalDateTime.now(),
            games = null
        )
        
        // Optimistically add user message
        val updatedMessages = _uiState.value.messages + newUserMessage
        _uiState.value = _uiState.value.copy(messages = updatedMessages, isLoading = true, error = null)

        viewModelScope.launch {
            val request = SendMessageRequest(
                message = content,
                sessionId = currentSessionId
            )
            val result = chatRepository.sendMessage(request)
            
            if (result.isSuccess) {
                val assistantMessage = result.getOrNull()
                if (assistantMessage != null) {
                    val finalMessages = _uiState.value.messages + assistantMessage
                    _uiState.value = _uiState.value.copy(
                        messages = finalMessages,
                        isLoading = false,
                        sessionId = assistantMessage.sessionId // Important if this was a new session!
                    )
                }
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Failed to send message"
                )
            }
        }
    }
}
