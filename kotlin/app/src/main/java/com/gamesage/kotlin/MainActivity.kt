package com.gamesage.kotlin

import android.content.Context
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

    // Inyectamos el gestor de tokens para controlar la sesión del usuario
    @Inject
    lateinit var tokenManager: TokenManager

    // Se ejecuta al inicio para configurar el contexto con el idioma guardado
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(onAttach(newBase))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Instalamos la pantalla de inicio (Splash Screen) con el logo de la app
        @Suppress("UnusedVariable", "unused") val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        // Cargamos el idioma preferido del usuario antes de mostrar la UI
        loadLocale(this)
        // Configura la barra de estado y navegación transparente/estética
        enableEdgeToEdge()
        
        // Destino por defecto: Pantalla de Inicio (Home)
        var startDestination: Any = Destinations.Home
        
        // Lógica de navegación desde notificaciones push
        // Si recibimos un ID de juego en el intent, navegamos directamente a su pantalla de producto
        val gameIdFromNotification = intent.getLongExtra("gameId", -1L)
        if (gameIdFromNotification != -1L) {
            startDestination = Destinations.Product(gameIdFromNotification)
        }
        
        // Lógica de "Recordarme"
        // Si hay un token pero el usuario NO marcó "Recordarme", borramos la sesión al iniciar
        runBlocking {
            val token = tokenManager.token.firstOrNull()
            val rememberMe = tokenManager.rememberMe.firstOrNull() ?: false
                if (token != null && !rememberMe) {
                    tokenManager.deleteToken() // Forzamos el logout si no se marcó "Recordarme"
                }
        }

        // Definimos el contenido de la aplicación con Compose
        setContent {
            AppTheme {
                // El NavGraph gestiona la navegación principal de la app
                NavGraph(
                    startDestination = startDestination,
                    tokenManager = tokenManager
                )
            }
        }
    }
}