package com.gamesage.kotlin.ui.navigation

import kotlinx.serialization.Serializable

@Serializable
sealed class Destinations(val route: String) {
    @Serializable
    data object Home: Destinations("home")
    //TODO Resto de rutas
}