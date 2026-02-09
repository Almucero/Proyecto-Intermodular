package com.gamesage.kotlin.ui.navigation

import android.app.Activity
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamesage.kotlin.R
import com.gamesage.kotlin.ui.common.Menu
import com.gamesage.kotlin.ui.pages.cart.CartScreen
import com.gamesage.kotlin.ui.pages.conditions.ConditionsScreen
import com.gamesage.kotlin.ui.pages.map.MapScreen
import com.gamesage.kotlin.ui.pages.contact.ContactScreen
import com.gamesage.kotlin.ui.pages.cookies.CookiesScreen
import com.gamesage.kotlin.ui.pages.dashboard.CameraScreen
import com.gamesage.kotlin.ui.pages.dashboard.CaptureScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreenViewModel
import com.gamesage.kotlin.ui.pages.dashboard.imageFileToBase64
import com.gamesage.kotlin.ui.pages.login.LoginScreen
import com.gamesage.kotlin.ui.pages.privacy.PrivacyScreen
import com.gamesage.kotlin.ui.pages.register.RegisterScreen
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavGraph(
    startDestination: String = Destinations.Home.route,
    tokenManager: com.gamesage.kotlin.data.local.TokenManager
) {
    val navController: NavHostController = rememberNavController()
    val context = LocalContext.current
    val token by tokenManager.token.collectAsState(initial = null)
    var showBottomSheet by remember { mutableStateOf(false) }
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val isAIChat = currentRoute == Destinations.AIChat.route
    var searchQuery by remember { mutableStateOf("") }
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    Menu(
        navController = navController,
        show = showBottomSheet,
        onDismiss = { showBottomSheet = false },
        onClearSearch = { searchQuery = "" }
    )

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            if (!isAIChat) {
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
                            onLanguageClick = { langCode ->
                                com.gamesage.kotlin.utils.LanguageUtils.setLocale(context, langCode)
                                (context as? Activity)?.recreate()
                            }
                        )
                    },
                    scrollBehavior = scrollBehavior,
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF030712)
                    )
                )
            }
        },
        bottomBar = {
            if (!isAIChat) {
                HomeBottomBar(
                    onMenuClick = { showBottomSheet = true },
                    onCartClick = { if (token != null) {
                        navController.navigate(Destinations.Cart.route)
                    } else {
                        navController.navigate(Destinations.Login.route)
                    } },
                    onFavoritesClick = { 
                         if (token != null) {
                             navController.navigate(Destinations.Favorites.route) 
                         } else {
                             navController.navigate(Destinations.Login.route)
                         }
                    },
                    onProfileClick = { 
                        if (token != null) {
                            navController.navigate(Destinations.Dashboard.route)
                        } else {
                            navController.navigate(Destinations.Login.route)
                        }
                    },
                    onAiChatClick = {
                        navController.navigate(Destinations.AIChat.route)
                    }
                )
            }
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
                    },
                    onGenreClick = { genre ->
                        navController.navigate(Destinations.Search.createRoute(genre = genre))
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
                    },
                    onNavigateToLogin = {
                        navController.navigate(Destinations.Login.route)
                    }
                )
            }
            composable(Destinations.Map.route) {
                MapScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Contact.route) {
                ContactScreen(
                    onNavigateToMap = { navController.navigate(Destinations.Map.route) }
                )
            }

            composable(Destinations.Cookies.route) {
                CookiesScreen(
                )
            }

            composable(Destinations.Terms.route) {
                ConditionsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Privacy.route) {
                PrivacyScreen(
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
                    },
                    navArgument("genre") {
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
                LoginScreen(
                    onNavigateToRegister = { navController.navigate(Destinations.Register.route) },
                    onLoginSuccess = {
                        navController.navigate(Destinations.Dashboard.route) {
                            popUpTo(Destinations.Login.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Destinations.Register.route) {
                RegisterScreen(
                    onNavigateToLogin = { navController.navigate(Destinations.Login.route) },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Destinations.Dashboard.route) { backStackEntry ->
                val viewModel: DashboardScreenViewModel = hiltViewModel(backStackEntry)
                val capturedPhoto by backStackEntry.savedStateHandle.getStateFlow<String?>(key = "capturedPhoto", initialValue = null).collectAsState()

                DashboardScreen(
                    onPrivacyClick = { navController.navigate(Destinations.Privacy) },
                    onLogout = {
                        viewModel.logout()
                        navController.navigate("login") {
                            popUpTo("dashboard") { inclusive = true }
                        }
                    },
                    onNavigateToCamera = { navController.navigate(Destinations.Camera.route) },
                    capturedPhoto = capturedPhoto,
                    viewModel = viewModel
                )
                LaunchedEffect(capturedPhoto) {
                    if (capturedPhoto != null) {
                        backStackEntry.savedStateHandle["capturedPhoto"] = null
                    }
                }
            }

            composable(Destinations.Camera.route) {
                CameraScreen(
                    modifier = Modifier.fillMaxSize(),
                    viewModel = viewModel(),
                    onNavigateToCapture = { file ->
                        navController.navigate(
                            Destinations.Capture(file.absolutePath)
                        )
                    }
                )
            }

            composable<Destinations.Capture> { backStackEntry ->
                val args = backStackEntry.arguments!!
                val photoPath = args.getString("photoPath") ?: ""

                CaptureScreen(
                    photoPath = photoPath,
                    onCancel = { navController.popBackStack() },
                    onSave = { path ->
                        navController.previousBackStackEntry
                            ?.savedStateHandle
                            ?.set("capturedPhoto", path)
                        navController.navigate(Destinations.Dashboard.route) {
                            popUpTo(Destinations.Dashboard.route) { inclusive = false }
                            launchSingleTop = true
                        }
                    }
                )
            }
            composable(Destinations.Cart.route) {
                CartScreen(
                )
            }

            composable(Destinations.Favorites.route) {
                com.gamesage.kotlin.ui.pages.favorites.FavoritesScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onGameClick = { gameId ->
                        navController.navigate("product/$gameId")
                    }
                )
            }

            composable(Destinations.AIChat.route) {
                com.gamesage.kotlin.ui.pages.aichat.AIChatScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToGame = { gameId ->
                        navController.navigate("product/$gameId")
                    },
                    onNavigateToLogin = {
                        navController.navigate(Destinations.Login.route)
                    }
                )
            }
        }
    }
}

