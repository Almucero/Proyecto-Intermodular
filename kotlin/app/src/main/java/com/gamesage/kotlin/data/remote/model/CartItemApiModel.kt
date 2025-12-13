package com.gamesage.kotlin.data.remote.model

data class CartItemApiModel(
    val cartItemId: Int,
    val quantity: Int,
    val addedAt: String,
    // Game fields (flattened from backend)
    val id: Int,
    val title: String,
    val price: Double?,
    val isOnSale: Boolean?,
    val salePrice: Double?,
    val rating: Float?,
    // Media is NOT here (that's why we fetch it separately in Repo)
    // Platform
    val platform: PlatformApiModel?,
    // Developer
    val Developer: DeveloperApiModel?
)
