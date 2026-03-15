package com.gamesage.kotlin.utils

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LoadingManager @Inject constructor() {
    private val _isBlocking = MutableStateFlow(false)
    val isBlocking = _isBlocking.asStateFlow()

    fun setBlocking(loading: Boolean) {
        _isBlocking.value = loading
    }
}
