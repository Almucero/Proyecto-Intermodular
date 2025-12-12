package com.gamesage.kotlin.data.remote.model

import com.gamesage.kotlin.data.model.*
import com.google.gson.annotations.SerializedName
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

data class GameApiModel(
    @SerializedName("id") val id: Int,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("price") val price: Double?,
    @SerializedName("isOnSale") val isOnSale: Boolean,
    @SerializedName("salePrice") val salePrice: Double?,
    @SerializedName("isRefundable") val isRefundable: Boolean,
    @SerializedName("numberOfSales") val numberOfSales: Int,
    @SerializedName("stockPc") val stockPc: Int?,
    @SerializedName("stockPs5") val stockPs5: Int?,
    @SerializedName("stockXboxX") val stockXboxX: Int?,
    @SerializedName("stockSwitch") val stockSwitch: Int?,
    @SerializedName("stockPs4") val stockPs4: Int?,
    @SerializedName("stockXboxOne") val stockXboxOne: Int?,
    @SerializedName("videoUrl") val videoUrl: String?,
    @SerializedName("rating") val rating: Float?,
    @SerializedName("releaseDate") val releaseDate: String?,
    @SerializedName("createdAt") val createdAt: String?,
    @SerializedName("updatedAt") val updatedAt: String?,
    @SerializedName("genres") val genres: List<GenreApiModel>?,
    @SerializedName("platforms") val platforms: List<PlatformApiModel>?,
    @SerializedName("media") val media: List<MediaApiModel>?,
    @SerializedName("publisherId") val publisherId: Int?,
    @SerializedName("developerId") val developerId: Int?,
    @SerializedName("Publisher") val publisher: PublisherApiModel?,
    @SerializedName("Developer") val developer: DeveloperApiModel?
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

