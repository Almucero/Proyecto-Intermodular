package com.gamesage.kotlin.data.local

import com.gamesage.kotlin.data.GameSageDataSource
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject

class GameSageLocalDataSource @Inject constructor(
    private val scope: CoroutineScope
): GameSageDataSource {

}