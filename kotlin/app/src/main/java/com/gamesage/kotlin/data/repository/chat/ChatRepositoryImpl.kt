package com.gamesage.kotlin.data.repository.chat

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.DeveloperDataSource
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject

class ChatRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: ChatDataSource,
    //@LocalDataSource private val localDataSource: ChatDataSource,
    private val scope: CoroutineScope
) : ChatRepository {
    override suspend fun getSessions(): List<ChatSessionApiModel> = remoteDataSource.getSessions()

    override suspend fun getSession(id: Int): ChatSessionApiModel = remoteDataSource.getSession(id)

    override suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel = remoteDataSource.sendMessage(request)

    override suspend fun deleteSession(id: Int) = remoteDataSource.deleteSession(id)
}
