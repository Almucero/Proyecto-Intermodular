package com.gamesage.kotlin.ui.navigation

import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.gamesage.kotlin.ui.common.TopBar
import androidx.navigation.compose.composable
import com.gamesage.kotlin.ui.pages.home.HomeScreen

@Composable
fun NavGraph() {
    val navController: NavHostController = rememberNavController()
    val startDestination = Destinations.Home.route
    val backStackEntry by navController.currentBackStackEntryAsState()
    Scaffold(
        modifier = Modifier.fillMaxSize(),
    ) { innerPadding ->
        val contentModifier = Modifier
            .consumeWindowInsets(innerPadding)
            .padding(innerPadding)
        NavHost(
            navController = navController,
            startDestination = startDestination
        ) {
            composable(Destinations.Home.route) {
                HomeScreen(
                    modifier = contentModifier
                )
            }

            // TODO: Agregar más destinos aquí
        }
    }
}