package com.gamesage.kotlin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.ui.navigation.Destinations
import com.gamesage.kotlin.ui.navigation.NavGraph
import com.gamesage.kotlin.ui.theme.AppTheme
import com.gamesage.kotlin.utils.LanguageUtils.loadLocale
import com.gamesage.kotlin.utils.LanguageUtils.onAttach
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

// TODO: IMPORTANTE -> Revisa el archivo README.md en la raíz del proyecto para configurar tu API Key de Maps.
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenManager: TokenManager

    override fun attachBaseContext(newBase: android.content.Context) {
        super.attachBaseContext(onAttach(newBase))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        @Suppress("UnusedVariable", "unused") val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        loadLocale(this)
        enableEdgeToEdge()
        
        var startDestination: Any = Destinations.Home
        
        // Navegación desde notificación
        val gameIdFromNotification = intent.getLongExtra("gameId", -1L)
        if (gameIdFromNotification != -1L) {
            startDestination = Destinations.Product(gameIdFromNotification)
        }
        
        runBlocking {
            val token = tokenManager.token.firstOrNull()
            val rememberMe = tokenManager.rememberMe.firstOrNull() ?: false
                if (token != null && !rememberMe) {
                    tokenManager.deleteToken()
                }
        }

        setContent {
            AppTheme {
                NavGraph(
                    startDestination = startDestination,
                    tokenManager = tokenManager
                )
            }
        }
    }
}