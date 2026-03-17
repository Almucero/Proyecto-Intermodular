package com.gamesage.kotlin.data.remote.model

data class FavoriteApiModel(
    val favoritedAt: String? = null,
    val id: Int = 0,
    val gameId: Int? = null,
    val title: String = "",
    val price: Double? = null,
    val isOnSale: Boolean? = false,
    val salePrice: Double? = null,
    val rating: Float? = null,
    @Suppress("PropertyName") val Developer: DeveloperApiModel? = null,
    val platform: PlatformApiModel? = null,
    val platformId: Int? = null,
    val media: List<MediaApiModel>? = null,
    val platforms: List<PlatformApiModel>? = null
) {
    val realGameId: Int get() = gameId ?: id
    val realPlatformId: Int get() = platformId ?: platform?.id ?: 0
}