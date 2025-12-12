package com.gamesage.kotlin.data.remote.model

import kotlinx.serialization.Serializable

@Serializable
data class SignInRequest(
    val email: String,
    val password: String
)

@Serializable
data class SignUpRequest(
    val name: String,
    val surname: String,
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserApiModel? = null // Assuming we might get user info back, nullable for now
)
