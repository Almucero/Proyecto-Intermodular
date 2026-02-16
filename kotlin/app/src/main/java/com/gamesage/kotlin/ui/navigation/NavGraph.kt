package com.gamesage.kotlin.ui.navigation

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.toRoute
import com.gamesage.kotlin.ui.pages.home.HomeScreen
import com.gamesage.kotlin.ui.pages.product.ProductScreen
import com.gamesage.kotlin.ui.common.TopBar
import com.gamesage.kotlin.ui.common.HomeBottomBar
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.ui.common.Menu
import com.gamesage.kotlin.ui.pages.cart.CartScreen
import com.gamesage.kotlin.ui.pages.conditions.ConditionsScreen
import com.gamesage.kotlin.ui.pages.contact.MapScreen
import com.gamesage.kotlin.ui.pages.contact.ContactScreen
import com.gamesage.kotlin.ui.pages.cookies.CookiesScreen
import com.gamesage.kotlin.ui.pages.dashboard.CameraScreen
import com.gamesage.kotlin.ui.pages.dashboard.CaptureScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreenViewModel
import com.gamesage.kotlin.ui.pages.login.LoginScreen
import com.gamesage.kotlin.ui.pages.privacy.PrivacyScreen
import com.gamesage.kotlin.ui.pages.register.RegisterScreen
import com.gamesage.kotlin.ui.pages.search.SearchScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavGraph(
    startDestination: Any = Destinations.Home,
    tokenManager: TokenManager
) {
    val navController: NavHostController = rememberNavController()
    val context = LocalContext.current
    val token by tokenManager.token.collectAsState(initial = null)
    var showBottomSheet by remember { mutableStateOf(false) }
    val backStackEntry by navController.currentBackStackEntryAsState()
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
                CenterAlignedTopAppBar(
                    title = {
                        TopBar(
                            searchQuery = searchQuery,
                            onSearchQueryChange = { query ->
                                searchQuery = query
                            },
                            onSearchClick = {
                                if (searchQuery.isNotEmpty()) {
                                    navController.navigate(Destinations.Search(query = searchQuery))
                                }
                            },
                            onLogoClick = {
                                 navController.navigate(Destinations.Home) {
                                     popUpTo(Destinations.Home) { inclusive = true }
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

        },
        bottomBar = {
                HomeBottomBar(
                    onMenuClick = { showBottomSheet = true },
                    onCartClick = { if (token != null) {
                        navController.navigate(Destinations.Cart)
                    } else {
                        navController.navigate(Destinations.Login)
                    } },
                    onFavoritesClick = { 
                         if (token != null) {
                             navController.navigate(Destinations.Favorites) 
                         } else {
                             navController.navigate(Destinations.Login)
                         }
                    },
                    onProfileClick = { 
                        if (token != null) {
                            navController.navigate(Destinations.Dashboard)
                        } else {
                            navController.navigate(Destinations.Login)
                        }
                    },
                )
        },
        containerColor = Color(0xFF111827)
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable<Destinations.Home> {
                HomeScreen(
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    },
                    onGenreClick = { genre ->
                        navController.navigate(Destinations.Search(genre = genre))
                    }
                )
            }

            composable<Destinations.Product> { backStackEntry ->
                val product = backStackEntry.toRoute<Destinations.Product>()
                ProductScreen(
                    gameId = product.gameId,
                    onNavigateBack = {
                        navController.popBackStack()
                    },
                    onNavigateToLogin = {
                        navController.navigate(Destinations.Login)
                    }
                )
            }
            composable<Destinations.Map> {
                MapScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable<Destinations.Contact> {
                ContactScreen(
                    onNavigateToMap = { navController.navigate(Destinations.Map) }
                )
            }

            composable<Destinations.Cookies> {
                CookiesScreen(
                )
            }

            composable<Destinations.Terms> {
                ConditionsScreen(
                )
            }

            composable<Destinations.Privacy> {
                PrivacyScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable<Destinations.Search> { backStackEntry ->
                val searchArgs = backStackEntry.toRoute<Destinations.Search>()
                LaunchedEffect(searchArgs.query) {
                    if (!searchArgs.query.isNullOrEmpty()) {
                        searchQuery = searchArgs.query
                    }
                }

                SearchScreen(
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    }
                )
            }

            composable<Destinations.Login> {
                LoginScreen(
                    onNavigateToRegister = { navController.navigate(Destinations.Register) },
                    onLoginSuccess = {
                        navController.navigate(Destinations.Dashboard) {
                            popUpTo(Destinations.Login) { inclusive = true }
                        }
                    }
                )
            }

            composable<Destinations.Register> {
                RegisterScreen(
                    onNavigateToLogin = { navController.navigate(Destinations.Login) },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable<Destinations.Dashboard> { backStackEntry ->
                val viewModel: DashboardScreenViewModel = hiltViewModel(backStackEntry)
                val capturedPhoto by backStackEntry.savedStateHandle.getStateFlow<String?>(key = "capturedPhoto", initialValue = null).collectAsState()

                DashboardScreen(
                    onPrivacyClick = { navController.navigate(Destinations.Privacy) },
                    onLogout = {
                        viewModel.logout()
                        navController.navigate(Destinations.Login) {
                            popUpTo(Destinations.Dashboard) { inclusive = true }
                        }
                    },
                    onNavigateToCamera = { navController.navigate(Destinations.Camera) },
                    capturedPhoto = capturedPhoto,
                    viewModel = viewModel
                )
                LaunchedEffect(capturedPhoto) {
                    if (capturedPhoto != null) {
                        backStackEntry.savedStateHandle["capturedPhoto"] = null
                    }
                }
            }

            composable<Destinations.Camera> {
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
                val captureArgs = backStackEntry.toRoute<Destinations.Capture>()
                val photoPath = captureArgs.photoPath

                CaptureScreen(
                    photoPath = photoPath,
                    onCancel = { navController.popBackStack() },
                    onSave = { path ->
                        navController.previousBackStackEntry
                            ?.savedStateHandle
                            ?.set("capturedPhoto", path)
                        navController.navigate(Destinations.Dashboard) {
                            popUpTo(Destinations.Dashboard) { inclusive = false }
                            launchSingleTop = true
                        }
                    }
                )
            }
            composable<Destinations.Cart> {
                CartScreen(
                )
            }

            composable<Destinations.Favorites> {
                com.gamesage.kotlin.ui.pages.favorites.FavoritesScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    }
                )
            }
        }
    }
}

