package com.gamesage.kotlin.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.gamesage.kotlin.ui.pages.home.HomeScreen
import com.gamesage.kotlin.ui.pages.product.ProductScreen
import com.gamesage.kotlin.ui.common.TopBar
import com.gamesage.kotlin.ui.common.HomeBottomBar
import kotlinx.coroutines.launch
import androidx.compose.ui.input.nestedscroll.nestedScroll

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavGraph() {
    val navController: NavHostController = rememberNavController()
    val startDestination = Destinations.Home.route
    val backStackEntry by navController.currentBackStackEntryAsState()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    var showBottomSheet by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    TopBar(
                        searchQuery = searchQuery,
                        onSearchQueryChange = { query ->
                            searchQuery = query
                        },
                        onSearchClick = {
                            if (searchQuery.isNotEmpty()) {
                                navController.navigate(Destinations.Search.createRoute(searchQuery))
                            }
                        },
                        onLogoClick = {
                             navController.navigate(Destinations.Home.route) {
                                 popUpTo(Destinations.Home.route) { inclusive = true }
                             }
                        },
                        onLanguageClick = { /* TODO */ }
                    )
                },
                scrollBehavior = scrollBehavior,
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF030712)
                )
            )
        },
        bottomBar = {
            HomeBottomBar(
                onMenuClick = { showBottomSheet = true },
                onProfileClick = { navController.navigate(Destinations.Login.route) }
            )
        },
        containerColor = Color(0xFF111827)
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Destinations.Home.route) {
                HomeScreen(
                    onGameClick = { gameId ->
                        navController.navigate("product/$gameId")
                    }
                )
            }

            composable(
                route = Destinations.Product.route,
                arguments = listOf(
                    navArgument("gameId") { type = NavType.LongType }
                )
            ) { backStackEntry ->
                val gameId = backStackEntry.arguments?.getLong("gameId") ?: 0L
                ProductScreen(
                    gameId = gameId,
                    onNavigateBack = {
                        navController.popBackStack()
                    }
                )
            }

            composable(Destinations.Contact.route) {
                com.gamesage.kotlin.ui.pages.contact.ContactScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Cookies.route) {
                com.gamesage.kotlin.ui.pages.cookies.CookiesScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Terms.route) {
                com.gamesage.kotlin.ui.pages.conditions.ConditionsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Privacy.route) {
                com.gamesage.kotlin.ui.pages.privacy.PrivacyScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(
                route = Destinations.Search.route,
                arguments = listOf(
                    navArgument("query") { 
                        type = NavType.StringType
                        defaultValue = ""
                        nullable = true
                    }
                )
            ) { backStackEntry ->
                val queryArg = backStackEntry.arguments?.getString("query")
                LaunchedEffect(queryArg) {
                    if (!queryArg.isNullOrEmpty()) {
                        searchQuery = queryArg
                    }
                }
                
                com.gamesage.kotlin.ui.pages.search.SearchScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onGameClick = { gameId ->
                        navController.navigate("product/$gameId")
                    }
                )
            }

            composable(Destinations.Login.route) {
                com.gamesage.kotlin.ui.pages.login.LoginScreen(
                    onNavigateToRegister = { navController.navigate(Destinations.Register.route) },
                    onLoginSuccess = {
                         navController.navigate(Destinations.Home.route) {
                             popUpTo(Destinations.Login.route) { inclusive = true }
                         }
                    }
                )
            }

            composable(Destinations.Register.route) {
                com.gamesage.kotlin.ui.pages.register.RegisterScreen(
                    onNavigateToLogin = { navController.navigate(Destinations.Login.route) },
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
    if (showBottomSheet) {
        ModalBottomSheet(
            onDismissRequest = { showBottomSheet = false },
            sheetState = sheetState,
            containerColor = Color(0xFF030712),
            dragHandle = null
        ) {
            MenuBottomSheetContent(
                navController = navController,
                onCloseMenu = {
                    scope.launch {
                        sheetState.hide()
                        showBottomSheet = false
                    }
                }
            )
        }
    }
}

@Composable
fun MenuBottomSheetContent(
    navController: NavHostController,
    onCloseMenu: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF030712))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF030712))
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Menú",
                color = Color(0xFF93E3FE),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF111827))
        ) {

            MenuItemRow(
                icon = Icons.Default.Search,
                text = "Explorar",
                onClick = {
                    navController.navigate(Destinations.Search.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Settings,
                text = "Ajustes",
                onClick = { /* TODO */ }
            )
            MenuItemRow(
                icon = Icons.Default.Info,
                text = "Ayuda",
                onClick = { /* TODO */ }
            )
            MenuItemRow(
                icon = Icons.Default.Person,
                text = "Contacto",
                onClick = {
                    navController.navigate(Destinations.Contact.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Lock,
                text = "Políticas de privacidad",
                onClick = {
                    navController.navigate(Destinations.Privacy.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.List,
                text = "Términos y condiciones",
                onClick = {
                    navController.navigate(Destinations.Terms.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Star,
                text = "Configuración de cookies",
                onClick = {
                    navController.navigate(Destinations.Cookies.route)
                    onCloseMenu()
                }
            )
        }

        Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
        HomeBottomBar(onMenuClick = onCloseMenu)
    }
}

@Composable
fun MenuItemRow(
    icon: ImageVector,
    text: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = text,
            tint = Color.White,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = text,
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Normal
        )
    }
    Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
}