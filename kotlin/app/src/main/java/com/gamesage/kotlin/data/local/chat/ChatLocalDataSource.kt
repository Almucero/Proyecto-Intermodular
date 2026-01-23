package com.gamesage.kotlin.data.local.chat

import com.gamesage.kotlin.data.ChatDataSource
import com.gamesage.kotlin.data.GameDataSource
import com.gamesage.kotlin.data.local.game.GameDao
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

//class ChatLocalDataSource  @Inject constructor(
//    private val scope: CoroutineScope,
//private val chatDao: ChatDao): ChatDataSource{
//
//    override suspend fun getSessions(): List<ChatSessionApiModel> {
//        TODO("Not yet implemented")
//    }
//
//    override suspend fun getSession(id: Int): ChatSessionApiModel {
//        TODO("Not yet implemented")
//    }
//
//    override suspend fun sendMessage(request: SendMessageRequest): ChatResponseApiModel {
//        TODO("Not yet implemented")
//    }
//
//    override suspend fun deleteSession(id: Int) {
//        TODO("Not yet implemented")
//    }
//}