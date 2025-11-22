package com.gamesage.kotlin.ui.navigation

import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHost
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.gamesage.kotlin.ui.common.TopBar
import androidx.navigation.compose.composable

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    val startDestination = Destinations.Home
    val backStackEntry by navController.currentBackStackEntryAsState()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopBar(backStackEntry)
        }
    ) {
        innerPadding ->
        val contentModifier = Modifier.consumeWindowInsets(innerPadding).padding(innerPadding)
        //TODO Resto de destinos junto con sus pantallas y metodos
//        NavHost(
//            navController = navController,
//            startDestination = startDestination
//        ) {
//            composable<Destinations.Home> {
//                HomeScreen(
//                    modifier = contentModifier,
//
//                )
//            }
//        }
    }
}