package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.GameSageDataSource
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject

class GameSageRemoteDataSource @Inject constructor(
    private val api: GameSageApi,
    private val scope: CoroutineScope
): GameSageDataSource {

}