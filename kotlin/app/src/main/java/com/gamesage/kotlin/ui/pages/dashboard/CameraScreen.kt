package com.gamesage.kotlin.ui.pages.dashboard

import android.Manifest
import androidx.camera.compose.CameraXViewfinder
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Cached
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import java.io.File


@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun CameraScreen(
    viewModel: CameraViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCapture: (File) -> Unit
) {
    val cameraPermissionState = rememberPermissionState(
        Manifest.permission.CAMERA
    )
    // Tenemos permisos pintamos la pantalla
    if (cameraPermissionState.status.isGranted) {
        CameraPreview(
            viewModel = viewModel,
            onNavigateBack = onNavigateBack,
            onNavigateToCapture = onNavigateToCapture
        )
    }
    // No tenemos permisos de usar la camara
    else {
        LaunchedEffect(Unit) {
            cameraPermissionState.launchPermissionRequest()
        }
    }
}
@Composable
fun CameraPreview(
    viewModel: CameraViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToCapture: (File) -> Unit,
    lifecycleOwner: LifecycleOwner = LocalLifecycleOwner.current,
) {
    // Obtenemos el contexto actual de la aplicación
    val context = LocalContext.current
    
    // Observamos el estado del "SurfaceRequest" desde el ViewModel.
    // Esto es lo que CameraX usa para saber donde pintar los fotogramas de la cámara en la pantalla.
    val surfaceRequest by viewModel.surfaceRequest.collectAsStateWithLifecycle()

    // Usamos LaunchedEffect para asegurarnos de que la cámara se inicializa y se "ata" (bind) 
    // al ciclo de vida de esta pantalla solo una vez al abrirse.
    LaunchedEffect(lifecycleOwner) {
        viewModel.bindToCamera(
            context = context.applicationContext,
            lifecycleOwner = lifecycleOwner
        )
    }

    // Contenedor principal que ocupa toda la pantalla
    Box(modifier = Modifier.fillMaxSize()) {
        // Solo pintamos la vista si la cámara ya nos ha dado el SurfaceRequest válido
        surfaceRequest?.let { request ->
            // Componente visual nativo de CameraX que muestra lo que ve la cámara
            CameraXViewfinder(
                surfaceRequest = request,
                modifier = Modifier.fillMaxSize()
            )

            // Botón de Volver Atrás (Arriba a la izquierda)
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .align(Alignment.TopStart) // Lo posicionamos arriba a la izquierda
                    .padding(16.dp)
                    .size(48.dp),
                colors = IconButtonDefaults.iconButtonColors(
                    containerColor = Color(0xFF22D3EE)
                )
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White
                )
            }

            // Fila de botones inferiores (Cambiar cámara y Hacer Foto)
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter) // Abajo en el centro
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Botón para alternar entre cámara frontal y trasera
                Button(
                    onClick = {
                        viewModel.switchCamera(lifecycleOwner)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF22D3EE)
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Cached,
                        contentDescription = "Switch Camera",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                // Botón principal para realizar la foto
                Button(
                    onClick = {
                        // Le decimos al ViewModel que tome la foto
                        viewModel.takePhoto(context) { file ->
                            // Cuando la foto se guarda con éxito en un archivo, saltamos a la siguiente pantalla
                            onNavigateToCapture(file)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF22D3EE)
                    )
                ) {
                    Icon(
                        imageVector = Icons.Filled.PhotoCamera,
                        contentDescription = "do Picture",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}