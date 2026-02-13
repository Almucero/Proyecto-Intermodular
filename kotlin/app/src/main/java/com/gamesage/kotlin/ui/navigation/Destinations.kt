package com.gamesage.kotlin.ui.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed class Destinations(val route: String) {

    @Serializable
    data class Capture(
        val photoPath: String
    ) : Destinations("CaptureScreen/$photoPath")

    @Serializable
    object Camera : Destinations("CameraScreen")

    @Serializable
    object Home : Destinations("home")

    @Serializable
    object Map : Destinations("map")

    @Serializable
    data class Product(val gameId: Long) : Destinations("product/$gameId")

    @Serializable
    data class Search(val query: String? = null, val genre: String? = null) : Destinations("search?query=$query&genre=$genre")

    @Serializable
    object Contact : Destinations("contact")

    @Serializable
    object Cookies : Destinations("cookies")

    @Serializable
    object Terms : Destinations("terms")

    @Serializable
    object Login : Destinations("login")

    @Serializable
    object Register : Destinations("register")

    @Serializable
    object Privacy : Destinations("privacy")

    @Serializable
    object Dashboard : Destinations("dashboard")

    @Serializable
    object Cart : Destinations("cart")

    @Serializable
    object Favorites : Destinations("favorites")

    @Serializable
    object AIChat : Destinations("aichat")
}