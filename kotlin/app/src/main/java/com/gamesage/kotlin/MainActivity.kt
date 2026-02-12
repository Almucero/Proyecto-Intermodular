package com.gamesage.kotlin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.gamesage.kotlin.ui.navigation.NavGraph
import com.gamesage.kotlin.ui.theme.AppTheme
import com.gamesage.kotlin.utils.LanguageUtils.loadLocale
import com.gamesage.kotlin.utils.LanguageUtils.onAttach
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenManager: com.gamesage.kotlin.data.local.TokenManager

    override fun attachBaseContext(newBase: android.content.Context) {
        super.attachBaseContext(onAttach(newBase))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        loadLocale(this)
        enableEdgeToEdge()
        
        var startDestination = "home"
        
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