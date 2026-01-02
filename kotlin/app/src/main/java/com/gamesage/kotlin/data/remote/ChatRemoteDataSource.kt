package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import javax.inject.Inject

class ChatRemoteDataSource @Inject constructor(
    private val api: GameSageApi
) : ChatDataSource {
    override suspend fun getSessions(): List<ChatSessionApiModel> = api.getSessions()

    override suspend fun getSession(id: Int): ChatSessionApiModel = api.getSession(id)

    override suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel = api.sendMessage(request)

    override suspend fun deleteSession(id: Int) = api.deleteSession(id)
}
