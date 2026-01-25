package com.gamesage.kotlin.ui.pages.map

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.rememberCameraPositionState


@Composable
fun MapScreen(onNavigateBack: () -> Unit ) {
val malaga = LatLng(36.747688, -4.0)
val cameraPositionState = rememberCameraPositionState {
    position = CameraPosition.fromLatLngZoom(malaga, 10f)
}
GoogleMap(
modifier = Modifier.fillMaxSize(),
cameraPositionState = cameraPositionState
)

}