package com.gamesage.kotlin.ui.pages.dashboard

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import java.io.File

@Composable
fun CaptureScreen(
    photoPath: String,
    onCancel: () -> Unit,
    onSave: (String) -> Unit
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
        Row(
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
        Button(
            onClick = { onSave(photoPath)},
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF22D3EE)
            ),
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Guardar")
        }
        Button(
            onClick = onCancel,
            modifier = Modifier.padding(top = 16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF22D3EE)
            )
        ) {
            Text("Volver")
        }
    }
}}