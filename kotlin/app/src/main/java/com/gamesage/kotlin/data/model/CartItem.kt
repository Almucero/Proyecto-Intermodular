package com.gamesage.kotlin.data.model

data class CartItem(
    val userId: Int,
    val gameId: Int,
    val platformId: Int,
    val quantity: Int,
    val game: Game? = null
)
