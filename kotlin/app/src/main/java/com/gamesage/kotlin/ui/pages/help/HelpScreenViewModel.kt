package com.gamesage.kotlin.ui.pages.help

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class HelpScreenViewModel : ViewModel() {

    private val _expandedFaqs = MutableStateFlow<Map<Int, Boolean>>(emptyMap())
    val expandedFaqs: StateFlow<Map<Int, Boolean>> = _expandedFaqs.asStateFlow()

    private val _isModalVisible = MutableStateFlow(false)
    val isModalVisible: StateFlow<Boolean> = _isModalVisible.asStateFlow()

    private val _modalImageRes = MutableStateFlow<Int?>(null)
    val modalImageRes: StateFlow<Int?> = _modalImageRes.asStateFlow()

    private val _modalCaption = MutableStateFlow("")
    val modalCaption: StateFlow<String> = _modalCaption.asStateFlow()

    fun toggleFaq(index: Int) {
        val current = _expandedFaqs.value
        val isExpanded = current[index] ?: false
        _expandedFaqs.value = current + (index to !isExpanded)
    }

    fun openScreenshotModal(imageRes: Int, caption: String) {
        _modalImageRes.value = imageRes
        _modalCaption.value = caption
        _isModalVisible.value = true
    }

    fun closeScreenshotModal() {
        _isModalVisible.value = false
    }
}