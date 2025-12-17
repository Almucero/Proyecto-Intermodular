package com.gamesage.kotlin.data.remote.model

import com.google.gson.annotations.SerializedName

data class FavoriteApiModel(
    @SerializedName("favoriteId") val id: Int,
    @SerializedName("favoritedAt") val createdAt: String,
    @SerializedName("id") val gameId: Int,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("price") val price: Double? = null,
    @SerializedName("isOnSale") val isOnSale: Boolean? = false,
    @SerializedName("salePrice") val salePrice: Double? = null,
    @SerializedName("isRefundable") val isRefundable: Boolean? = false,
    @SerializedName("numberOfSales") val numberOfSales: Int? = 0,
    @SerializedName("videoUrl") val videoUrl: String? = null,
    @SerializedName("rating") val rating: Float? = null,
    @SerializedName("releaseDate") val releaseDate: String? = null,
    @SerializedName("platform") val platform: PlatformApiModel? = null,
    @SerializedName("media") val media: List<MediaApiModel>? = null,
    @SerializedName("genres") val genres: List<GenreApiModel>? = null
)
