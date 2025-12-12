package com.gamesage.kotlin.ui.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed class Destinations(val route: String) {
    @Serializable
    data object Home: Destinations("home")
    
    @Serializable
    data class Product(val gameId: Long): Destinations("product/{gameId}") {
        companion object {
            const val route = "product/{gameId}"
        }
    }
    
    @Serializable
    data object Search: Destinations("search?query={query}") {
        fun createRoute(query: String = ""): String {
            return if (query.isNotEmpty()) "search?query=$query" else "search"
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
}