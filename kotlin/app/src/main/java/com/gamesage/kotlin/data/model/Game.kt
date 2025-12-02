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
    val stock: Int?,
    val videoUrl: String?,
    val rating: Float?,
    val releaseDate: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val genres: List<Genre>?,
    val platforms: List<Platform>?,
    val media: List<Media>?,
    val publisherId: Int?,
    val developerId: Int?,
    val Publisher: Publisher?,
    val Developer: Developer?
)
