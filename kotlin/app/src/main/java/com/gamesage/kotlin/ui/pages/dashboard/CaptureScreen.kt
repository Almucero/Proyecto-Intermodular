package com.gamesage.kotlin.ui.pages.dashboard

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp

@Composable
fun CaptureScreen(
    photoPath: String,
    onCancel: () -> Unit
) {
    val bitmap = remember(photoPath) {
        BitmapFactory.decodeFile(photoPath)
    }

    Column(
        modifier = Modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Image(
            bitmap = bitmap.asImageBitmap(),
            contentDescription = null
        )

        Button(
            onClick = onCancel,
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Volver")
        }
    }
}