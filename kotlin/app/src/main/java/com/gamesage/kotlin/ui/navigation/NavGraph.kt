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
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavGraph(
    startDestination: String = Destinations.Home.route,
    tokenManager: com.gamesage.kotlin.data.local.TokenManager
) {
    val navController: NavHostController = rememberNavController()
    val context = androidx.compose.ui.platform.LocalContext.current
    val token by tokenManager.token.collectAsState(initial = null)
    
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
                        onLanguageClick = { langCode ->
                            com.gamesage.kotlin.utils.LanguageUtils.setLocale(context, langCode)
                            (context as? android.app.Activity)?.recreate()
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
                onCartClick = { navController.navigate(Destinations.Cart.route) },
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
                }
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
                com.gamesage.kotlin.ui.pages.login.LoginScreen(
                    onNavigateToRegister = { navController.navigate(Destinations.Register.route) },
                    onLoginSuccess = {
                         navController.navigate(Destinations.Dashboard.route) {
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

            composable(Destinations.Dashboard.route) {
                com.gamesage.kotlin.ui.pages.dashboard.DashboardScreen(
                    onPrivacyClick = { navController.navigate(Destinations.Privacy.route) },
                    onLogout = {
                        navController.navigate(Destinations.Login.route) {
                            popUpTo(Destinations.Home.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Destinations.Cart.route) {
                com.gamesage.kotlin.ui.pages.cart.CartScreen(
                    onNavigateBack = { navController.popBackStack() }
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
                },
                onClearSearch = { searchQuery = "" }
            )
        }
    }
}

@Composable
fun MenuBottomSheetContent(
    navController: NavHostController,
    onCloseMenu: () -> Unit,
    onClearSearch: () -> Unit = {}
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
                text = stringResource(R.string.menu_title),
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
                text = stringResource(R.string.menu_explore),
                onClick = {
                    onClearSearch()
                    navController.navigate(Destinations.Search.createRoute())
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Settings,
                text = stringResource(R.string.menu_settings),
                onClick = { /* TODO */ }
            )
            MenuItemRow(
                icon = Icons.Default.Info,
                text = stringResource(R.string.menu_help),
                onClick = { /* TODO */ }
            )
            MenuItemRow(
                icon = Icons.Default.Person,
                text = stringResource(R.string.menu_contact),
                onClick = {
                    navController.navigate(Destinations.Contact.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Lock,
                text = stringResource(R.string.menu_privacy),
                onClick = {
                    navController.navigate(Destinations.Privacy.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.List,
                text = stringResource(R.string.menu_terms),
                onClick = {
                    navController.navigate(Destinations.Terms.route)
                    onCloseMenu()
                }
            )
            MenuItemRow(
                icon = Icons.Default.Star,
                text = stringResource(R.string.menu_cookies),
                onClick = {
                    navController.navigate(Destinations.Cookies.route)
                    onCloseMenu()
                }
            )
        }

        Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
        HomeBottomBar(
            onMenuClick = onCloseMenu,
            onCartClick = {
                navController.navigate(Destinations.Cart.route)
                onCloseMenu()
            }
        )
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