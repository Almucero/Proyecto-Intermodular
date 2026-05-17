package com.gamesage.kotlin.data.remote.model

data class CheckoutSessionResponse(
    val clientSecret: String,
    val sessionId: String,
    val publishableKey: String
)

data class ConfirmCheckoutRequest(
    val sessionId: String
)

data class CreateCheckoutSessionRequest(
    val locale: String?
)

data class DirectCheckoutRequest(
    val gameId: Int,
    val platformId: Int,
    val locale: String?
)
