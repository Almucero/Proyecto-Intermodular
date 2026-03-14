package com.gamesage.kotlin.data.remote.model

data class SignInRequest(
    val email: String,
    val password: String
)

data class SignUpRequest(
    val name: String,
    val surname: String,
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val user: UserApiModel? = null
)
