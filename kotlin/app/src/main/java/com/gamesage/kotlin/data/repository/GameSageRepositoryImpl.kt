package com.gamesage.kotlin.data.repository

import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject
import com.gamesage.kotlin.data.GameSageDataSource

class GameSageRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: GameSageDataSource,
    @LocalDataSource private val localDataSource: GameSageDataSource,
    private val scope: CoroutineScope
): GameSageRepository {

}