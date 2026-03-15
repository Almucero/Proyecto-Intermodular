package com.gamesage.kotlin.data.remote.model

data class FavoriteApiModel(
    val favoritedAt: String? = null,
    
    // El backend a veces devuelve el ID del juego como 'id' y otras como 'gameId'
    // Gson mapeará ambos si el JSON es inconsistente entre endpoints
    val id: Int = 0,
    val gameId: Int? = null,

    val title: String = "",
    val price: Double? = null,
    val isOnSale: Boolean? = false,
    val salePrice: Double? = null,
    val rating: Float? = null,
    @Suppress("PropertyName") val Developer: DeveloperApiModel? = null,
    
    // La plataforma viene como un objeto anidado en getUserFavorites
    val platform: PlatformApiModel? = null,
    // Pero en otros sitios puede venir como platformId raíz
    val platformId: Int? = null,

    val media: List<MediaApiModel>? = null,
    val platforms: List<PlatformApiModel>? = null
) {
    // Propiedades calculadas seguras que priorizan los campos que sabemos que usa el backend (visto en Prisma)
    val realGameId: Int get() = gameId ?: id
    val realPlatformId: Int get() = platformId ?: platform?.id ?: 0
}