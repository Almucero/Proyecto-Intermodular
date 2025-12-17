package com.gamesage.kotlin.data.remote.model

data class CartItemApiModel(
    val cartItemId: Int,
    val quantity: Int,
    val addedAt: String,
    val id: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean?,
    val salePrice: Double?,
    val rating: Float?,
    val platform: PlatformApiModel?,
    val Developer: DeveloperApiModel?
)
