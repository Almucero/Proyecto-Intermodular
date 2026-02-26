package com.gamesage.kotlin.data.remote.model

import com.google.gson.annotations.SerializedName

data class FavoriteApiModel(
    val id: Int,
    val createdAt: String,
    val gameId: Int,
    val title: String,
    val description: String? = null,
    val price: Double? = null,
    val isOnSale: Boolean? = false,
    val salePrice: Double? = null,
    val isRefundable: Boolean? = false,
    val numberOfSales: Int? = 0,
    val videoUrl: String? = null,
    val rating: Float? = null,
    val releaseDate: String? = null,
    val platform: PlatformApiModel? = null,
    val media: List<MediaApiModel>? = null,
    val genres: List<GenreApiModel>? = null
)
