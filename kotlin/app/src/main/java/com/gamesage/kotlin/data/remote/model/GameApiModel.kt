package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.*
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

data class GameApiModel(
    val id: Int,
    val title: String,
    val description: String?,
    val price: Double?,
    val isOnSale: Boolean,
    val salePrice: Double?,
    val isRefundable: Boolean,
    val numberOfSales: Int,
    val stockPc: Int?,
    val stockPs5: Int?,
    val stockXboxX: Int?,
     val stockSwitch: Int?,
    val stockPs4: Int?,
    val stockXboxOne: Int?,
    val videoUrl: String?,
    val rating: Float?,
    val releaseDate: String?,
    val createdAt: String?,
    val updatedAt: String?,
    val genres: List<GenreApiModel>?,
    val platforms: List<PlatformApiModel>?,
    val media: List<MediaApiModel>?,
    val publisherId: Int?,
    val developerId: Int?,
    val publisher: PublisherApiModel?,
    val developer: DeveloperApiModel?
)

fun GameApiModel.toDomain(): Game {
    return Game(
        id = id,
        title = title,
        description = description,
        price = price,
        isOnSale = isOnSale,
        salePrice = salePrice,
        isRefundable = isRefundable,
        numberOfSales = numberOfSales,
        stockPc = stockPc,
        stockPs5 = stockPs5,
        stockXboxX = stockXboxX,
        stockSwitch = stockSwitch,
        stockPs4 = stockPs4,
        stockXboxOne = stockXboxOne,
        videoUrl = videoUrl,
        rating = rating,
        releaseDate = releaseDate?.let { 
            Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() 
        },
        createdAt = createdAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        updatedAt = updatedAt?.let { Instant.parse(it).atZone(ZoneId.systemDefault()).toLocalDateTime() } ?: LocalDateTime.now(),
        genres = genres?.map { it.toDomain() },
        platforms = platforms?.map { it.toDomain() },
        media = media?.map { it.toDomain() },
        publisherId = publisherId,
        developerId = developerId,
        Publisher = publisher?.toDomain(),
        Developer = developer?.toDomain()
    )
}

