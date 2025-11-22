package com.gamesage.kotlin.data.model

import java.time.LocalDateTime

data class Game(
    val id: Int,
    val title: String,
    val description: String?,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val isRefundable: Boolean,
    val numberOfSales: Int,
    val rating: Float?,
    val releaseDate: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val genres: List<Genre> = emptyList(), //Cuidado
    val platforms: List<Platform> = emptyList(), //Cuidado
    val images: List<GameImage> = emptyList(), //Cuidado
    val publisherId: Int?,
    val developerId: Int?,
    val publisher: Publisher?,
    val developer: Developer?
)
