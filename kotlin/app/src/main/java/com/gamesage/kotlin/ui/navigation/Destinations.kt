package com.gamesage.kotlin.ui.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed class Destinations(val route: String) {

    @Serializable
    data class Capture(
        val photoPath: String
    ) : Destinations("CaptureScreen/{photoPath}")

    @Serializable
    object Camera: Destinations("CameraScreen")

    @Serializable
    data object Home: Destinations("home")

    @Serializable
    data object Map: Destinations("map")
    
    @Serializable
    data class Product(val gameId: Long): Destinations("product/{gameId}") {
        companion object {
            const val route = "product/{gameId}"
        }
    }
    
    @Serializable
    data object Search: Destinations("search?query={query}&genre={genre}") {
        fun createRoute(query: String = "", genre: String = ""): String {
            val params = mutableListOf<String>()
            if (query.isNotEmpty()) params.add("query=$query")
            if (genre.isNotEmpty()) params.add("genre=$genre")
            return if (params.isNotEmpty()) "search?${params.joinToString("&")}" else "search"
        }
    }
    
    @Serializable
    data object Contact: Destinations("contact")
    
    @Serializable
    data object Cookies: Destinations("cookies")
    
    @Serializable
    data object Terms: Destinations("terms")
    
    @Serializable
    data object Login: Destinations("login")

    @Serializable
    data object Register: Destinations("register")

    @Serializable
    data object Privacy: Destinations("privacy")

    @Serializable
    data object Dashboard: Destinations("dashboard")

    @Serializable
    data object Cart: Destinations("cart")

    @Serializable
    data object Favorites: Destinations("favorites")
    
    @Serializable
    data object AIChat : Destinations("aichat")
}