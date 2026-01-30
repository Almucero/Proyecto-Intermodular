package com.gamesage.kotlin.ui.pages.dashboard

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.camera.core.CameraSelector.DEFAULT_FRONT_CAMERA
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.SurfaceRequest
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.lifecycle.awaitInstance
import androidx.camera.core.Preview
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.UserApiModel
import com.gamesage.kotlin.data.repository.user.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import java.util.concurrent.Executors
import javax.inject.Inject


data class DashboardUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val isEditing: Boolean = false,
    val editableUser: UserEditableData = UserEditableData(),
    val error: String? = null
)

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
    val avatar: String? = null
)

@HiltViewModel
class DashboardScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val api: GameSageApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadUser()
    }

    fun loadUser() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = userRepository.me()
            if (result.isSuccess) {
                val user = result.getOrNull()
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        user = user,
                        editableUser = user?.toEditableData() ?: UserEditableData()
                    )
                }
            } else {
                _uiState.update { it.copy(isLoading = false, error = "Error al cargar el perfil") }
            }
        }
    }

    fun toggleEdit() {
        _uiState.update { 
            val newIsEditing = !it.isEditing
            if (!newIsEditing && it.user != null) {
                it.copy(isEditing = newIsEditing, editableUser = it.user.toEditableData())
            } else {
                it.copy(isEditing = newIsEditing)
            }
        }
    }

    fun onEditableDataChange(data: UserEditableData) {
        _uiState.update { it.copy(editableUser = data) }
    }

    fun saveChanges() {
        val currentUser = _uiState.value.user ?: return
        val editable = _uiState.value.editableUser

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val updateRequest = UserApiModel(
                    id = currentUser.id,
                    email = editable.email,
                    name = editable.name,
                    surname = editable.surname,
                    nickname = editable.nickname,
                    addressLine1 = editable.addressLine1,
                    addressLine2 = editable.addressLine2,
                    city = editable.city,
                    region = editable.region,
                    postalCode = editable.postalCode,
                    country = editable.country,
                    avatar = editable.avatar
                )
                
                api.updateOwnUser(updateRequest)
                loadUser()
                _uiState.update { it.copy(isEditing = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "Error al guardar los cambios") }
            }
        }
    }
    
    fun logout() {
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