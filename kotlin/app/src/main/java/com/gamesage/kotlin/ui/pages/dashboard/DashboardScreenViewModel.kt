package com.gamesage.kotlin.ui.pages.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.UpdateProfileRequest
import com.gamesage.kotlin.data.repository.user.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody

data class UserEditableData(
    val nickname: String = "",
    val email: String = "",
    val name: String = "",
    val surname: String = "",
    val addressLine1: String = "",
    val addressLine2: String = "",
    val city: String = "",
    val region: String = "",
    val postalCode: String = "",
    val country: String = "",
    val avatar: String? = null,
    val selectedFile: File? = null
)

sealed class DashboardUiState {
    object Initial : DashboardUiState()
    object Loading : DashboardUiState()
    data class Success(
        val user: User,
        val isEditing: Boolean = false,
        val editableUser: UserEditableData
    ) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

@HiltViewModel
class DashboardScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val api: GameSageApi,
) : ViewModel() {
    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Initial)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    // Para mostrar mensajes de error temporales (tipo Snackbar) sin ocultar el contenido
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    private var isLoggingOut = false

    init {
        observeUser()
    }

    // Observa el perfil del usuario de forma reactiva
    private fun observeUser() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            //Observa los cambios en los datos del usuario a través del repositorio
            userRepository.observeMe().collect { result ->
                result.onSuccess { user ->
                    val currentState = _uiState.value
                    if (currentState is DashboardUiState.Success) {
                        // Si ya estábamos editando, mantenemos los datos que el usuario está escribiendo
                        _uiState.value = currentState.copy(user = user)
                    } else {
                        //// Si no estamos editando, mostramos los datos del usuario en el estado
                        _uiState.value = DashboardUiState.Success(
                            user = user,
                            editableUser = user.toEditableData()
                        )
                    }
                }.onFailure {
                    // Si no hay datos ni siquiera en local, mostramos error de carga
                    // Pero lo ignoramos si estamos en proceso de cerrar sesión
                    if (!isLoggingOut && _uiState.value !is DashboardUiState.Success) {
                        _uiState.value = DashboardUiState.Error("No se ha podido cargar el perfil")
                    }
                }
            }
        }
    }

    // Activa o desactiva el modo edición
    fun toggleEdit() {
        val state = _uiState.value
        if (state is DashboardUiState.Success) {
            //Se invierte el valor de isEditing, que indica si el perfil está actualmente en modo edición o no
            val newIsEditing = !state.isEditing
            _uiState.value = state.copy(
                //Cambiamos el estado de 'isEditing' para reflejar si estamos en modo edición o no
                isEditing = newIsEditing,
                editableUser = if (!newIsEditing)
                    //Si no estamos en modo edición, restauramos los datos originales
                    state.user.toEditableData()
                // Si estamos en modo edición, mantenemos los datos ya editados
                else state.editableUser
            )
        }
    }

    // Actualiza los datos temporales del formulario
    fun onEditableDataChange(data: UserEditableData) {
        // Obtenemos el estado actual de la UI
        val state = _uiState.value
        // Verificamos si el estado actual es de tipo 'Success', que indica que los datos del usuario han sido cargados correctamente
        if (state is DashboardUiState.Success) {
            // Actualizamos los datos temporales del formulario con los nuevos datos
            _uiState.value = state.copy(editableUser = data)
        }
    }

    // Guarda los cambios en el servidor (foto y datos personales)
    fun saveChanges() {
        val state = _uiState.value
        // Si el estado no es 'Success', no realizamos ninguna acción, ya que no hay datos de usuario válidos
        if (state !is DashboardUiState.Success) return
        // Extraemos los datos del usuario actual y los datos editables
        val currentUser = state.user
        val editable = state.editableUser

        viewModelScope.launch {
            try {
                // Subir imagen si el usuario ha seleccionado una nueva
                editable.selectedFile?.let { file ->
                    // Si el usuario ha seleccionado un archivo, lo convertimos a 'MultipartBody' para enviarlo en la solicitud
                    val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                    val body = okhttp3.MultipartBody.Part.createFormData("file", file.name, requestFile)
                    val typePart = okhttp3.MultipartBody.Part.createFormData("type", "user")
                    val idPart = okhttp3.MultipartBody.Part.createFormData("id", currentUser.id.toString())
                    // Realizamos la llamada para cargar la imagen al servidor
                    api.createMedia(body, typePart, idPart)
                }

                // Actualizar datos de texto
                val updateRequest = UpdateProfileRequest(
                    name = editable.name,
                    surname = editable.surname,
                    email = editable.email,
                    nickname = editable.nickname,
                    addressLine1 = editable.addressLine1,
                    addressLine2 = editable.addressLine2,
                    city = editable.city,
                    region = editable.region,
                    postalCode = editable.postalCode,
                    country = editable.country
                )
                // Realizamos la llamada para actualizar los datos del usuario
                api.updateOwnUser(updateRequest)

                // Salimos del modo edición. Después de guardar, la UI se actualizará automáticamente con los datos más recientes
                _uiState.value = state.copy(isEditing = false)
            } catch (e: Exception) {
                // Si falla el guardado, se muestra el error por Snackbar y seguimos en modo edición con los datos guardados localmente
                val isNetworkError = e is java.io.IOException || e is java.net.UnknownHostException
                _errorMessage.value = if (isNetworkError) "Sin conexión a internet" else "Error al guardar los cambios"
            }
        }
    }
    
    // Cierra la sesión del usuario
    fun logout() {
        viewModelScope.launch {
            // Marca el estado como "en proceso de cierre de sesión"
            isLoggingOut = true
            // Llama al repositorio para cerrar la sesión del usuario
            userRepository.logout().onSuccess {
                // Si el cierre de sesión es exitoso, se cambia el estado de la UI a 'Initial',la pantalla de login
                _uiState.value = DashboardUiState.Initial
            }.onFailure { e ->
                // Si ocurre un error durante el cierre de sesión, se marca como no estando en proceso de cierre
                isLoggingOut = false
                val isNetworkError = e is java.io.IOException || e is java.net.UnknownHostException
                _errorMessage.value = if (isNetworkError) "Sin conexión a internet" else "Error al cerrar sesión"
            }
        }
    }
    // Limpia el mensaje de error después de visualizarlo
    fun clearError() {
        _errorMessage.value = null
    }
}

fun User.toEditableData() = UserEditableData(
    nickname = nickname ?: "",
    email = email,
    name = name,
    surname = surname ?: "",
    addressLine1 = addressLine1 ?: "",
    addressLine2 = addressLine2 ?: "",
    city = city ?: "",
    region = region ?: "",
    postalCode = postalCode ?: "",
    country = country ?: "",
    avatar = avatar
)