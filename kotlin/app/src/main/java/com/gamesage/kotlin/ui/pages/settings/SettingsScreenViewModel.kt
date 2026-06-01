package com.gamesage.kotlin.ui.pages.settings

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.User
import com.gamesage.kotlin.data.remote.model.UpdateProfileRequest
import com.gamesage.kotlin.data.repository.user.UserRepository
import com.gamesage.kotlin.utils.LanguageUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.IOException
import javax.inject.Inject

data class SettingsUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val isSaving: Boolean = false,
    val isSaved: Boolean = false,
    val error: String? = null,
    val deleteAccountConfirmArmed: Boolean = false,
    val isDeleting: Boolean = false,
    val navigateToLogin: Boolean = false,
    val emailNotificationsEnabled: Boolean = true,
    val notificationEmail: String = "",
    val emailNotificationLanguage: String = "",
    val emailNotificationFrequency: String = "weekly",
    val emailRecommendationIntervalDays: Int = 7,
    val emailQuietHoursStart: Int = 22,
    val emailQuietHoursEnd: Int = 8,
    val pauseDays: Int = 0,
    val topics: Map<String, Boolean> = emptyMap()
)

@HiltViewModel
class SettingsScreenViewModel @Inject constructor(
    private val userRepository: UserRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val localizedContext: Context
        get() = LanguageUtils.onAttach(context)

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            userRepository.me().onSuccess { user ->
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        user = user,
                        emailNotificationsEnabled = user.emailNotificationsEnabled ?: true,
                        notificationEmail = user.notificationEmail ?: user.email,
                        emailNotificationLanguage = user.emailNotificationLanguage ?: "",
                        emailNotificationFrequency = user.emailNotificationFrequency ?: "weekly",
                        emailRecommendationIntervalDays = user.emailRecommendationIntervalDays ?: 7,
                        emailQuietHoursStart = user.emailQuietHoursStart ?: 22,
                        emailQuietHoursEnd = user.emailQuietHoursEnd ?: 8,
                        topics = user.emailNotificationTopics ?: state.topics
                    )
                }
            }.onFailure { e ->
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    fun onEmailNotificationsToggle(enabled: Boolean) {
        _uiState.update { it.copy(emailNotificationsEnabled = enabled) }
    }

    fun onNotificationEmailChange(email: String) {
        _uiState.update { it.copy(notificationEmail = email) }
    }

    fun onLanguageChange(lang: String) {
        _uiState.update { it.copy(emailNotificationLanguage = lang) }
    }

    fun onFrequencyChange(freq: String) {
        _uiState.update { it.copy(emailNotificationFrequency = freq) }
    }

    fun onIntervalChange(days: Int) {
        _uiState.update { it.copy(emailRecommendationIntervalDays = days) }
    }

    fun onQuietHoursStartChange(hour: Int) {
        _uiState.update { it.copy(emailQuietHoursStart = hour) }
    }

    fun onQuietHoursEndChange(hour: Int) {
        _uiState.update { it.copy(emailQuietHoursEnd = hour) }
    }

    fun onPauseDaysChange(days: Int) {
        _uiState.update { it.copy(pauseDays = days) }
    }

    fun onTopicToggle(key: String, enabled: Boolean) {
        _uiState.update { state ->
            state.copy(topics = state.topics.toMutableMap().apply { put(key, enabled) })
        }
    }

    fun saveSettings() {
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true, isSaved = false, error = null) }
            val state = _uiState.value
            val user = state.user ?: return@launch

            val request = UpdateProfileRequest(
                name = user.name,
                surname = user.surname,
                email = user.email,
                nickname = user.nickname,
                addressLine1 = user.addressLine1,
                addressLine2 = user.addressLine2,
                city = user.city,
                region = user.region,
                postalCode = user.postalCode,
                country = user.country,
                emailNotificationsEnabled = state.emailNotificationsEnabled,
                notificationEmail = state.notificationEmail,
                emailNotificationLanguage = state.emailNotificationLanguage.ifBlank { null },
                emailNotificationFrequency = state.emailNotificationFrequency,
                emailRecommendationIntervalDays = state.emailRecommendationIntervalDays,
                emailQuietHoursStart = state.emailQuietHoursStart,
                emailQuietHoursEnd = state.emailQuietHoursEnd,
                emailNotificationTopics = state.topics
            )

            userRepository.updateMe(request).onSuccess {
                _uiState.update { it.copy(isSaving = false, isSaved = true) }
            }.onFailure { e ->
                _uiState.update { it.copy(isSaving = false) }
                if (e is IOException) {
                    _errorMessage.value = localizedContext.getString(R.string.error_profile_save_network)
                } else {
                    _uiState.update { it.copy(error = e.message) }
                }
            }
        }
    }

    fun toggleDeleteConfirmation() {
        _uiState.update { it.copy(deleteAccountConfirmArmed = !it.deleteAccountConfirmArmed) }
    }

    fun confirmDeleteAccount() {
        viewModelScope.launch {
            _uiState.update { it.copy(deleteAccountConfirmArmed = false, isDeleting = true) }
            userRepository.deleteMe().fold(
                onSuccess = {
                    _uiState.update { it.copy(isDeleting = false, navigateToLogin = true) }
                },
                onFailure = { e ->
                    val errorMsg = if (e is IOException)
                        localizedContext.getString(R.string.error_delete_account_network)
                    else
                        localizedContext.getString(R.string.error_delete_account_generic)
                    _uiState.update { it.copy(isDeleting = false) }
                    _errorMessage.value = errorMsg
                }
            )
        }
    }

    fun clearNavigateToLogin() {
        _uiState.update { it.copy(navigateToLogin = false) }
    }

    fun clearError() {
        _errorMessage.value = null
    }
}