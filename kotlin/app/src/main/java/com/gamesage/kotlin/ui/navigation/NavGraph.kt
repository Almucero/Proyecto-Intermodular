package com.gamesage.kotlin.ui.navigation

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.ui.common.HomeBottomBar
import com.gamesage.kotlin.ui.common.Menu
import com.gamesage.kotlin.ui.common.TopBar
import com.gamesage.kotlin.ui.pages.cart.CartScreen
import com.gamesage.kotlin.ui.pages.conditions.ConditionsScreen
import com.gamesage.kotlin.ui.pages.contact.ContactScreen
import com.gamesage.kotlin.ui.pages.contact.MapScreen
import com.gamesage.kotlin.ui.pages.cookies.CookiesScreen
import com.gamesage.kotlin.ui.pages.dashboard.CameraScreen
import com.gamesage.kotlin.ui.pages.dashboard.CaptureScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreen
import com.gamesage.kotlin.ui.pages.dashboard.DashboardScreenViewModel
import com.gamesage.kotlin.ui.pages.favorites.FavoritesScreen
import com.gamesage.kotlin.ui.pages.home.HomeScreen
import com.gamesage.kotlin.ui.pages.login.LoginScreen
import com.gamesage.kotlin.ui.pages.privacy.PrivacyScreen
import com.gamesage.kotlin.ui.pages.product.ProductScreen
import com.gamesage.kotlin.ui.pages.register.RegisterScreen
import com.gamesage.kotlin.ui.pages.search.SearchScreen
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun NavGraph(
    startDestination: Any = Destinations.Home,
    tokenManager: TokenManager
) {
    val navController: NavHostController = rememberNavController()
    val context = LocalContext.current
    val token by tokenManager.token.collectAsState(initial = null)
    var showBottomSheet by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    // Solicitar permiso de notificaciones
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val notificationPermissionState = rememberPermissionState(
            android.Manifest.permission.POST_NOTIFICATIONS
        )
        
        if (!notificationPermissionState.status.isGranted) {
            LaunchedEffect(Unit) {
                notificationPermissionState.launchPermissionRequest()
            }
        }
    }

    Menu(
        navController = navController,
        show = showBottomSheet,
        onDismiss = {
            @Suppress("AssignedValueIsNeverRead")
            showBottomSheet = false
        },
        onClearSearch = { searchQuery = "" }
    )

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
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
        bottomBar = {
                HomeBottomBar(
                    onMenuClick = {
                        @Suppress("AssignedValueIsNeverRead")
                        showBottomSheet = true
                    },
                    onCartClick = {
                        if (token != null) {
                            navController.navigate(Destinations.Cart) {
                                popUpTo(Destinations.Home) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        } else {
                            navController.navigate(Destinations.Login)
                        }
                    },
                    onFavoritesClick = {
                        if (token != null) {
                            navController.navigate(Destinations.Favorites) {
                                popUpTo(Destinations.Home) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        } else {
                            navController.navigate(Destinations.Login)
                        }
                    },
                    onProfileClick = {
                        if (token != null) {
                            navController.navigate(Destinations.Dashboard) {
                                popUpTo(Destinations.Home) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
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
                        searchArgs.query
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
                        navController.navigate(Destinations.Login) {
                            popUpTo(Destinations.Dashboard) { inclusive = true }
                        }
                    },
                    onNavigateToCamera = { navController.navigate(Destinations.Camera) },
                    capturedPhoto = capturedPhoto,
                    viewModel = viewModel,
                    onPhotoProcessed = {
                        backStackEntry.savedStateHandle["capturedPhoto"] = null
                    }
                )
            }

            composable<Destinations.Camera> {
                CameraScreen(
                    viewModel = viewModel(),
                    onNavigateBack = { navController.popBackStack() },
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
                        navController.getBackStackEntry<Destinations.Dashboard>()
                            .savedStateHandle["capturedPhoto"] = path
                        navController.popBackStack<Destinations.Dashboard>(inclusive = false)
                    }
                )
            }
            composable<Destinations.Cart> {
                CartScreen(
                )
            }

            composable<Destinations.Favorites> {
                FavoritesScreen(
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    }
                )
            }
        }
    }
}

