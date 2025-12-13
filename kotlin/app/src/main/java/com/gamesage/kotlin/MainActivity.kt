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
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenManager: com.gamesage.kotlin.data.local.TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        var startDestination = "home"
        
        runBlocking {
            val token = tokenManager.token.firstOrNull()
            val rememberMe = tokenManager.rememberMe.firstOrNull() ?: false
            
            // if (token != null && rememberMe) {
            //    startDestination = "dashboard"
            // } else {
                // If rememberMe is false, we should ideally clear the token if it exists
                // to act like a session end.
                if (token != null && !rememberMe) {
                    tokenManager.deleteToken()
                }
            // }
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