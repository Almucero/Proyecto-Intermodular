package com.gamesage.kotlin.data.remote.model

import kotlinx.serialization.Serializable

@Serializable
data class UserApiModel(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String? = null,
    val nickname: String? = null,
    val accountId: String? = null,
    val accountAt: String? = null,
    val avatar: String? = null,
    val role: String? = null,
    val balance: Double? = null,
    val points: Int? = null,
    val isAdmin: Boolean = false
)
