package com.gamesage.kotlin.ui.pages.register

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.remote.model.SignUpRequest
import com.gamesage.kotlin.data.repository.user.UserRepository
import com.gamesage.kotlin.utils.NetworkUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// Estado para los datos del formulario
data class RegisterFormData(
    val name: String = "",
    val surname: String = "",
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = ""
)

sealed class RegisterUiState {
    object Initial : RegisterUiState()
    object Loading : RegisterUiState()
    object Success : RegisterUiState()
    data class Error(val message: String) : RegisterUiState()
}

@HiltViewModel
class RegisterScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val _uiState = MutableStateFlow<RegisterUiState>(RegisterUiState.Initial)
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    private val _formData = MutableStateFlow(RegisterFormData())
    val formData: StateFlow<RegisterFormData> = _formData.asStateFlow()

    // Para mostrar mensajes de error temporales (tipo Snackbar)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun onNameChange(name: String) {
        _formData.update { it.copy(name = name) }
    }

    fun onSurnameChange(surname: String) {
        _formData.update { it.copy(surname = surname) }
    }

    fun onEmailChange(email: String) {
        _formData.update { it.copy(email = email) }
    }

    fun onPasswordChange(password: String) {
        _formData.update { it.copy(password = password) }
    }

    fun onConfirmPasswordChange(confirmPassword: String) {
        _formData.update { it.copy(confirmPassword = confirmPassword) }
    }

    fun register() {
        val state = _formData.value

        if (!NetworkUtils.isOnline(context)) {
            _errorMessage.value = "Error: se necesita conexión a internet para registrarse"
            return
        }

        if (state.name.isBlank() || state.surname.isBlank() || state.email.isBlank() || state.password.isBlank() || state.confirmPassword.isBlank()) {
            _errorMessage.value = "Rellena todos los campos"
            return
        }

        if (state.password != state.confirmPassword) {
            _errorMessage.value = "Las contraseñas no coinciden"
            return
        }

        val passwordRegex = Regex("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}\$")
        if (!passwordRegex.matches(state.password)) {
            _errorMessage.value = "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
            return
        }

        viewModelScope.launch {
            _uiState.value = RegisterUiState.Loading
            _errorMessage.value = null

            val result = userRepository.signUp(
                SignUpRequest(
                    name = state.name,
                    surname = state.surname,
                    email = state.email,
                    password = state.password
                )
            )

            if (result.isSuccess) {
                _uiState.value = RegisterUiState.Success
            } else {
                _uiState.value = RegisterUiState.Error("Error al registrar la cuenta. Inténtalo de nuevo.")
                _errorMessage.value = "Error en el registro"
            }
        }
    }

    // Limpia el mensaje de error después de mostrarlo
    fun clearError() {
        _errorMessage.value = null
    }
}
