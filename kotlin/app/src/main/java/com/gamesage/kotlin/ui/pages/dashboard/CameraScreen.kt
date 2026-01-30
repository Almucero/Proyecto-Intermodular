package com.gamesage.kotlin.ui.pages.dashboard

import androidx.camera.compose.CameraXViewfinder
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.LocalLifecycleOwner
import java.io.File
import androidx.camera.core.SurfaceRequest
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.Icon
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun CameraScreen(
    viewModel: CameraViewModel,
    onNavigateToCapture: (File) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val surfaceRequest by viewModel.surfaceRequest.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.bindToCamera(
            context = context.applicationContext,
            lifecycleOwner = lifecycleOwner
        )
    }

    Box(modifier = Modifier.fillMaxSize()) {
        surfaceRequest?.let { request ->
        CameraXViewfinder(
            surfaceRequest = request,
            modifier = Modifier.fillMaxSize()
        )

        Button(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp),
            onClick = {
                viewModel.takePhoto(context) { file ->
                    onNavigateToCapture(file)
                }
            }
        ) {
            Icon(
                imageVector = Icons.Filled.PhotoCamera,
                contentDescription = "Change Picture",
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}}
