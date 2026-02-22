package com.gamesage.kotlin.data.remote.model

import kotlinx.serialization.Serializable

//Lo que el servidor nos da (información completa)
@Serializable
data class UserApiModel(
    val id: Int,
    val email: String,
    val name: String,
    val surname: String? = null,
    val nickname: String? = null,
    val accountId: String? = null,
    val accountAt: String? = null,
    val avatar: String? = null,
    val role: String? = null,
    val balance: Double? = null,
    val points: Int? = null,
    val isAdmin: Boolean = false,
    val addressLine1: String? = null,
    val addressLine2: String? = null,
    val city: String? = null,
    val region: String? = null,
    val postalCode: String? = null,
    val country: String? = null,
    val media: List<MediaApiModel>? = null
)
