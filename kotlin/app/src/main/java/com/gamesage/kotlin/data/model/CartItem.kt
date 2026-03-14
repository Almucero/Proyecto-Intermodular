package com.gamesage.kotlin.data.model

//Modelo de dominio para un producto en el carrito.
data class CartItem(
    val userId: Int,
    val gameId: Int,
    val platformId: Int,
    val quantity: Int,
    val game: Game? = null
)
