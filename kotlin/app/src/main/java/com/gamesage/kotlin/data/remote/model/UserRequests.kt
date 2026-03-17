package com.gamesage.kotlin.data.remote.model

data class UpdateProfileRequest(
    val name: String,
    val surname: String? = null,
    val email: String,
    val nickname: String? = null,
    val addressLine1: String? = null,
    val addressLine2: String? = null,
    val city: String? = null,
    val region: String? = null,
    val postalCode: String? = null,
    val country: String? = null
)
