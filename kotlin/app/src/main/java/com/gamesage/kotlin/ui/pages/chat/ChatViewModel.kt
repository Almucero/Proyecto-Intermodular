package com.gamesage.kotlin.ui.pages.chat

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.data.repository.chat.ChatRepository
import com.gamesage.kotlin.data.repository.user.UserRepository
import com.gamesage.kotlin.utils.LanguageUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import javax.inject.Inject

// Estados de pantalla
sealed class ChatUiState {
    object Initial : ChatUiState()
    object Loading : ChatUiState()
    data class Success(
        val sessions: List<ChatSession>,
        val sessionId: Int?,
        val messages: List<ChatMessage>,
        val userAvatar: String?,
        val isSessionLoading: Boolean = false,
        val isSendingMessage: Boolean = false
    ) : ChatUiState()
    data class Error(val message: String) : ChatUiState()
}

// Se comunica con el ChatRepository y UserRepository
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val userRepository: UserRepository,
    @ApplicationContext private val context: Context
): ViewModel() {

    private val localizedContext: Context
        get() = LanguageUtils.onAttach(context)

    private val _uiState = MutableStateFlow<ChatUiState>(ChatUiState.Initial)
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    // Para mostrar mensajes de error temporales (tipo Snackbar)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private var pendingSessionId: Int? = null

    // Cuando se crea el ViewModel, obtiene las sesiones y observa el usuario.
    init {
        fetchSessions()
        viewModelScope.launch {
            userRepository.observeMe().collect { result ->
                result.onSuccess { user ->
                    val current = _uiState.value
                    if (current is ChatUiState.Success) {
                        _uiState.value = current.copy(userAvatar = user.avatar)
                    }
                }
            }
        }
    }

    // Obtiene la lista de sesiones. Si ya estamos en Success no pone Loading para no perder sesión ni mensajes.
    fun fetchSessions() {
        viewModelScope.launch {
            val alreadySuccess = _uiState.value is ChatUiState.Success
            if (!alreadySuccess) {
                _uiState.value = ChatUiState.Loading
                delay(400)
            }
            val result = chatRepository.getSessions()
            if (result.isSuccess) {
                val sessions = result.getOrNull() ?: emptyList()
                val now = _uiState.value
                val pending = pendingSessionId
                if (now is ChatUiState.Success) {
                    _uiState.value = now.copy(sessions = sessions)
                } else {
                    val existingAvatar = null
                    _uiState.value = ChatUiState.Success(
                        sessions = sessions,
                        sessionId = null,
                        messages = emptyList(),
                        userAvatar = existingAvatar
                    )
                    if (pending != null && pending != -1) {
                        pendingSessionId = null
                        setSessionId(pending)
                    }
                }
            } else {
                if (!alreadySuccess) {
                    _uiState.value = ChatUiState.Error(
                        result.exceptionOrNull()?.message
                            ?: localizedContext.getString(R.string.error_chat_load_session)
                    )
                }
            }
        }
    }

    // Selecciona una sesión (o null/-1 para nuevo chat). Si aún no hay Success, guarda en pending.
    fun setSessionId(sessionId: Int?) {
        if (sessionId == null || sessionId == -1) {
            pendingSessionId = null
            val current = _uiState.value
            if (current is ChatUiState.Success) {
                _uiState.value = current.copy(sessionId = null, messages = emptyList())
            }
            return
        }
        val current = _uiState.value
        if (current !is ChatUiState.Success && current !is ChatUiState.Error) {
            pendingSessionId = sessionId
            return
        }
        if (current is ChatUiState.Success) {
            _uiState.value = current.copy(
                sessionId = sessionId,
                messages = emptyList(),
                isSessionLoading = true
            )
            loadSession(sessionId)
        } else {
            _uiState.value = ChatUiState.Loading
            viewModelScope.launch {
                delay(400)
                val sessionsResult = chatRepository.getSessions()
                if (sessionsResult.isSuccess) {
                    val sessions = sessionsResult.getOrNull() ?: emptyList()
                    _uiState.value = ChatUiState.Success(
                        sessions = sessions,
                        sessionId = sessionId,
                        messages = emptyList(),
                        userAvatar = null,
                        isSessionLoading = true
                    )
                    loadSession(sessionId)
                } else {
                    _uiState.value = ChatUiState.Error(
                        sessionsResult.exceptionOrNull()?.message
                            ?: localizedContext.getString(R.string.error_chat_load_session)
                    )
                }
            }
        }
    }

    // Carga los mensajes de una sesión y actualiza el estado.
    private fun loadSession(id: Int) {
        viewModelScope.launch {
            val result = chatRepository.getSession(id)
            val current = _uiState.value
            if (current is ChatUiState.Success) {
                if (result.isSuccess) {
                    val session = result.getOrNull()
                    _uiState.value = current.copy(
                        messages = session?.messages ?: emptyList(),
                        isSessionLoading = false
                    )
                } else {
                    _errorMessage.value = result.exceptionOrNull()?.message
                        ?: localizedContext.getString(R.string.error_chat_load_session)
                    _uiState.value = current.copy(isSessionLoading = false)
                }
            }
        }
    }

    // Añade el mensaje del usuario a la UI, envía a la API y añade la respuesta (o mensaje de error sin conexión).
    fun sendMessage(content: String, errorReplyText: String) {
        if (content.isBlank()) return
        val current = _uiState.value
        if (current !is ChatUiState.Success) return
        val currentId = current.sessionId
        val newUserMessage = ChatMessage(
            id = null,
            sessionId = currentId ?: 0,
            role = "user",
            content = content,
            createdAt = LocalDateTime.now(),
            games = null
        )
        val updatedMessages = current.messages + newUserMessage
        _uiState.value = current.copy(
            messages = updatedMessages,
            isSendingMessage = true
        )

        viewModelScope.launch {
            val request = SendMessageRequest(
                message = content,
                sessionId = currentId
            )
            val result = chatRepository.sendMessage(request)
            val stateAfterSend = _uiState.value
            if (stateAfterSend !is ChatUiState.Success) return@launch

            result.onSuccess { assistantMessage ->
                val finalMessages = stateAfterSend.messages + assistantMessage
                _uiState.value = stateAfterSend.copy(
                    messages = finalMessages,
                    isSendingMessage = false,
                    sessionId = assistantMessage.sessionId
                )
            }.onFailure { e ->
                if (e is java.io.IOException) {
                    delay(1500)
                    val autoReply = ChatMessage(
                        id = null,
                        sessionId = currentId ?: 0,
                        role = "assistant",
                        content = errorReplyText,
                        createdAt = LocalDateTime.now(),
                        games = null
                    )
                    _uiState.value = stateAfterSend.copy(
                        messages = stateAfterSend.messages + autoReply,
                        isSendingMessage = false
                    )
                } else {
                    _errorMessage.value = e.message ?: localizedContext.getString(R.string.error_generic)
                    _uiState.value = stateAfterSend.copy(isSendingMessage = false)
                }
            }
        }
    }

    // Limpia el mensaje de error después de mostrarlo
    fun clearError() {
        _errorMessage.value = null
    }

    // Vuelve a cargar las sesiones desde el estado Error
    fun retry() {
        _uiState.value = ChatUiState.Loading
        fetchSessions()
    }
}
