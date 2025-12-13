package com.gamesage.kotlin.ui.pages.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.UserApiModel
import com.gamesage.kotlin.data.repository.user.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
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
    val avatar: String? = null // Base64 string or URL
)

@HiltViewModel
class DashboardScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val api: GameSageApi // Using API directly for update as repo update might not be ready
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
            // Reset editable data if canceling edit
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
                // Construct API model for update
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
                
                // Refresh user data
                loadUser()
                _uiState.update { it.copy(isEditing = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "Error al guardar los cambios") }
            }
        }
    }
    
    fun logout() {
        // Implement logout logic (clear token, etc.)
        // For now just navigate away or clear state if needed
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