package com.gamesage.kotlin.ui.navigation

import androidx.lifecycle.ViewModel
import com.gamesage.kotlin.utils.LoadingManager
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class GlobalLoadingViewModel @Inject constructor(
    val loadingManager: LoadingManager
) : ViewModel()
