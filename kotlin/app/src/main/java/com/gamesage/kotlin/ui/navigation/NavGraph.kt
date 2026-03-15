package com.gamesage.kotlin.ui.navigation

import android.Manifest.permission.POST_NOTIFICATIONS
import android.app.Activity
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.absoluteOffset
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.ui.common.HomeBottomBar
import com.gamesage.kotlin.ui.common.Menu
import com.gamesage.kotlin.ui.common.TopBar
import com.gamesage.kotlin.ui.pages.cart.CartScreen
import com.gamesage.kotlin.ui.pages.chat.ChatScreen
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
import com.gamesage.kotlin.utils.LanguageUtils.setLocale
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
    val currentBackStackEntry by navController.currentBackStackEntryAsState()
    val focusManager = LocalFocusManager.current
    val keyboardController = LocalSoftwareKeyboardController.current

    // Gestor de carga global para bloquear la pantalla durante operaciones críticas
    val globalLoadingViewModel: GlobalLoadingViewModel = hiltViewModel()
    val isGlobalBlocking by globalLoadingViewModel.loadingManager.isBlocking.collectAsState()

    LaunchedEffect(currentBackStackEntry) {
        showBottomSheet = false
        if (currentBackStackEntry?.destination?.route?.contains("search", ignoreCase = true) != true) {
            searchQuery = ""
        }
    }

    val isChatScreen = currentBackStackEntry?.destination?.route?.contains("Destinations.Chat", ignoreCase = true) == true
    val isFormScreen = currentBackStackEntry?.destination?.route?.let { route ->
        route.contains("Chat", ignoreCase = true) ||
                route.contains("Login", ignoreCase = true) ||
                route.contains("Register", ignoreCase = true)
    } ?: false

    // Solicitar permiso de notificaciones
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val notificationPermissionState = rememberPermissionState(
            POST_NOTIFICATIONS
        )
        
        if (!notificationPermissionState.status.isGranted) {
            LaunchedEffect(Unit) {
                notificationPermissionState.launchPermissionRequest()
            }
        }
    }



    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection)
            .pointerInput(Unit) {
                detectTapGestures(onTap = {
                    keyboardController?.hide()
                    focusManager.clearFocus()
                })
            },
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
                    keyboardController?.hide()
                    focusManager.clearFocus()
                    navController.navigate(Destinations.Home) {
                        popUpTo(Destinations.Home) { inclusive = true }
                    }
                },
                onLanguageClick = { langCode ->
                    setLocale(context, langCode)
                    (context as? Activity)?.recreate()
                },
                onSearchFocus = {
                    showBottomSheet = false
                }
            )
        },
        bottomBar = {
                HomeBottomBar(
                    onMenuClick = {
                        showBottomSheet = !showBottomSheet
                    },
                    onCartClick = {
                        navController.navigate(Destinations.Cart) {
                            popUpTo(navController.graph.findStartDestination().id)
                            launchSingleTop = true
                        }
                    },
                    onFavoritesClick = {
                        navController.navigate(Destinations.Favorites) {
                            popUpTo(navController.graph.findStartDestination().id)
                            launchSingleTop = true
                        }
                    },
                    onAiChatClick = {
                        navController.navigate(Destinations.Chat(-1)) {
                            popUpTo(navController.graph.findStartDestination().id)
                            launchSingleTop = true
                        }
                    },
                    onProfileClick = {
                        if (token != null) {
                            navController.navigate(Destinations.Dashboard) {
                                popUpTo(navController.graph.findStartDestination().id)
                                launchSingleTop = true
                            }
                        } else {
                            navController.navigate(Destinations.Login)
                        }
                    },
                )
        },
        containerColor = Color(0xFF111827)
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize()) {
            NavHost(
                navController = navController,
                startDestination = startDestination,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .then(
                        if (!isFormScreen) {
                            Modifier.pointerInput(Unit) {
                                awaitEachGesture {
                                    awaitFirstDown(pass = PointerEventPass.Initial)
                                    keyboardController?.hide()
                                    focusManager.clearFocus()
                                }
                            }
                        } else {
                            Modifier
                        }
                    )
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
                    },
                    onNavigateToCart = {
                        navController.navigate(Destinations.Cart)
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
                    isLoggedIn = token != null,
                    onNavigateToGame = { gameId ->
                        navController.navigate(Destinations.Product(gameId.toLong()))
                    }
                )
            }

            composable<Destinations.Favorites> {
                FavoritesScreen(
                    isLoggedIn = token != null,
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    }
                )
            }

            composable<Destinations.Chat> { backStackEntry ->
                val chatArgs = backStackEntry.toRoute<Destinations.Chat>()
                ChatScreen(
                    isLoggedIn = token != null,
                    onNavigateToLogin = { navController.navigate(Destinations.Login) },
                    sessionId = chatArgs.sessionId,
                    onGameClick = { gameId ->
                        navController.navigate(Destinations.Product(gameId))
                    }
                )
            }
        }
        }

        Box(modifier = Modifier.fillMaxSize().zIndex(10f)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(28.dp)
                    .absoluteOffset(y = innerPadding.calculateTopPadding())
                    .align(Alignment.TopStart)
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(Color(0xFF111827), Color.Transparent)
                        )
                    )
            )
            if (!isChatScreen) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(28.dp)
                        .align(Alignment.BottomStart)
                        .absoluteOffset(y = -innerPadding.calculateBottomPadding())
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xFF111827))
                            )
                        )
                )
            }
        }

        Box(modifier = Modifier
            .padding(innerPadding)
            .fillMaxSize()
            .zIndex(100f)
        ) {
            Menu(
                navController = navController,
                show = showBottomSheet,
                onDismiss = {
                    showBottomSheet = false
                },
                onClearSearch = {
                    searchQuery = ""
                }
            )
        }

        }

        // Overlay de carga global: bloquea TODA la pantalla, incluyendo barras de navegación
        if (isGlobalBlocking) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(5000f)
                    .background(Color.Black.copy(alpha = 0.6f))
                    .pointerInput(Unit) {
                        // Intercepta todos los gestos para que no lleguen a la UI inferior
                        awaitEachGesture {
                            awaitFirstDown(pass = PointerEventPass.Initial)
                        }
                    }
                    .clickable(enabled = false) { },
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = Color(0xFF22D3EE),
                    modifier = Modifier.size(64.dp),
                    strokeWidth = 6.dp
                )
            }
        }
    }
}

