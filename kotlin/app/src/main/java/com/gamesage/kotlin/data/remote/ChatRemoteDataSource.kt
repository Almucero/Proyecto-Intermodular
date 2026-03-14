package com.gamesage.kotlin.data.remote

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.remote.api.GameSageApi
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import kotlinx.coroutines.CoroutineScope
import javax.inject.Inject

class ChatRemoteDataSource @Inject constructor(
    private val api: GameSageApi,
    @Suppress("unused") private val scope: CoroutineScope
): ChatDataSource {
    override suspend fun getSessions(): List<ChatSessionApiModel> {
        return api.getSessions()
    }

    override suspend fun getSession(id: Int): ChatSessionApiModel {
        return api.getSession(id)
    }

    override suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel {
        return api.sendMessage(request)
    }

    override suspend fun deleteSession(id: Int) {
        api.deleteSession(id)
    }
}
