package com.gamesage.kotlin

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.gamesage.kotlin.data.local.TokenManager
import com.gamesage.kotlin.ui.navigation.Destinations
import com.gamesage.kotlin.ui.navigation.NavGraph
import com.gamesage.kotlin.ui.theme.AppTheme
import com.gamesage.kotlin.utils.LanguageUtils.loadLocale
import com.gamesage.kotlin.utils.LanguageUtils.onAttach
import com.gamesage.kotlin.utils.NetworkMonitor
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenManager: TokenManager

    @Inject
    lateinit var networkMonitor: NetworkMonitor

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(onAttach(newBase))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        loadLocale(this)
        enableEdgeToEdge()

        var startDestination: Any = Destinations.Home
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
                // Estado inicial síncrono para que la app no arranque "pensando" que no hay red
                val initialState = remember { networkMonitor.isOnlineStatus() }
                val isOnline by networkMonitor.isOnline.collectAsState(initial = initialState)

                val snackbarHostState = remember { SnackbarHostState() }

                // Controlamos si hemos pasado por un estado offline
                var wasOffline by remember { mutableStateOf(!initialState) }

                val msgLost = stringResource(R.string.network_lost)
                val msgRestored = stringResource(R.string.network_restored)

                // Lógica de disparo de Snackbars
                LaunchedEffect(isOnline) {
                    if (!isOnline) {
                        wasOffline = true
                        snackbarHostState.showSnackbar(
                            message = msgLost,
                            duration = SnackbarDuration.Short
                        )
                    } else if (wasOffline) {
                        // Solo si antes estuvimos desconectados, avisamos de la vuelta de conexión
                        snackbarHostState.showSnackbar(
                            message = msgRestored,
                            duration = SnackbarDuration.Short
                        )
                        wasOffline = false
                    }
                }

                Box(modifier = Modifier.fillMaxSize()) {
                    // Contenido de la App
                    NavGraph(
                        startDestination = startDestination,
                        tokenManager = tokenManager
                    )

                    // El aviso flotante de conexión (Snackbar)
                    SnackbarHost(
                        hostState = snackbarHostState,
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 100.dp)
                    ) { data ->
                        val isError = data.visuals.message == msgLost
                        val shape = RoundedCornerShape(24.dp)

                        Snackbar(
                            modifier = Modifier
                                .padding(horizontal = 32.dp)
                                .widthIn(max = 280.dp)
                                .wrapContentWidth()
                                .border(BorderStroke(1.dp, Color.White), shape),
                            containerColor = if (isError) Color(0xFFEF4444) else Color(0xFF10B981),
                            contentColor = Color.White,
                            shape = shape
                        ) {
                            Text(
                                text = data.visuals.message,
                                modifier = Modifier.fillMaxWidth(),
                                textAlign = TextAlign.Center,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}