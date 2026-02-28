package com.gamesage.kotlin.ui.pages.login

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.remote.model.SignInRequest
import com.gamesage.kotlin.data.repository.user.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// Estado para los datos del formulario de login
data class LoginFormData(
    val email: String = "",
    val password: String = "",
    val rememberMe: Boolean = false
)

//Estados de pantalla
sealed class LoginUiState {
    object Initial : LoginUiState()
    object Loading : LoginUiState()
    object Success : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

@HiltViewModel
class LoginScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Initial)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _formData = MutableStateFlow(LoginFormData())
    val formData: StateFlow<LoginFormData> = _formData.asStateFlow()

    // Para mensajes de error temporales (tipo Snackbar)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Se llama cuando cambia el email en el TextField
    fun onEmailChange(email: String) {
        // Copia el estado actual y actualiza solo el email
        _formData.update { it.copy(email = email) }
    }

    // Se llama cuando cambia la contraseña en el TextField
    fun onPasswordChange(password: String) {
        _formData.update { it.copy(password = password) }
    }

    // Se llama cuando el usuario marca o desmarca "Remember Me"
    fun onRememberMeChange(rememberMe: Boolean) {
        _formData.update { it.copy(rememberMe = rememberMe) }
    }


    fun login() {
        // Obtiene el estado actual del formulario
        val state = _formData.value
        //si algún campo está vacío, muestra error
        if (state.email.isBlank() || state.password.isBlank()) {
            _errorMessage.value = "Rellena todos los campos"
            return
        }

        viewModelScope.launch {
            // Cambia el estado a Loading para mostrar indicador de carga
            _uiState.value = LoginUiState.Loading
            // Limpia posibles errores anteriores
            _errorMessage.value = null
            // Llama al repositorio para intentar iniciar sesión
            val result = userRepository.signIn(
                SignInRequest(
                    email = state.email,
                    password = state.password
                )
            )

            if (result.isSuccess) {
                // Guarda la preferencia de "Recordarme"
                userRepository.saveRememberMe(state.rememberMe)
                // Cambia el estado a Success
                _uiState.value = LoginUiState.Success
            } else {
                val exception = result.exceptionOrNull()
                // Verifica si es un error de red
                val isNetworkError = exception is java.io.IOException || exception is java.net.UnknownHostException
                
                val userMessage = if (isNetworkError) {
                    "No hay conexión a internet. Verifica tu red."
                } else {
                    "Usuario no registrado o credenciales incorrectas"
                }
                // Actualiza el estado general de error
                _uiState.value = LoginUiState.Error(userMessage)
                // Mensaje corto para Snackbar
                _errorMessage.value = if (isNetworkError) "Error de conexión" else "Error al iniciar sesión"
            }
        }
    }

    // Limpia el mensaje de error después de mostrarlo
    fun clearError() {
        _errorMessage.value = null
    }
}
