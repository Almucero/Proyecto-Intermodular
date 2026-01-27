package com.gamesage.kotlin.ui.pages.map

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
@Composable
fun MapScreen(onNavigateBack: () -> Unit) {

    val calle = LatLng(36.72152, -4.42142)
    val markerState = remember { MarkerState(position = calle) }


    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(calle, 16f)
    }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState
    ) {
        Marker(
            state = markerState,
            title = "Calle Sancha de Lara",
            snippet = "Centro Histórico · Málaga"
        )
    }
}