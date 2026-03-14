package com.gamesage.kotlin.data.local.chat

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ChatDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: ChatSessionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSessions(sessions: List<ChatSessionEntity>)

    @Query("SELECT * FROM chat_sessions ORDER BY id DESC")
    suspend fun getAllSessions(): List<ChatSessionEntity>
    
    @Query("SELECT * FROM chat_sessions WHERE id = :id")
    suspend fun getSessionById(id: Int): ChatSessionEntity?

    @Query("DELETE FROM chat_sessions WHERE id = :id")
    suspend fun deleteSession(id: Int)

    // Messages
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<ChatMessageEntity>)

    @Query("SELECT * FROM chat_messages WHERE sessionId = :sessionId ORDER BY localId ASC")
    suspend fun getMessagesForSession(sessionId: Int): List<ChatMessageEntity>
    
    @Query("SELECT * FROM chat_messages WHERE sessionId = :sessionId ORDER BY localId ASC")
    fun observeMessagesForSession(sessionId: Int): Flow<List<ChatMessageEntity>>

    @Query("DELETE FROM chat_messages WHERE sessionId = :sessionId")
    suspend fun deleteMessagesForSession(sessionId: Int)
}
