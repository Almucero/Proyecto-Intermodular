package com.gamesage.kotlin.ui.pages.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R
import java.io.File

@Composable
fun CaptureScreen(
    photoPath: String,
    onCancel: () -> Unit,
    onSave: (String) -> Unit
) {
    Column(
        modifier = Modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AsyncImage(
            model = File(photoPath),
            contentDescription = null,
            modifier = Modifier.weight(1f),
            contentScale = ContentScale.Fit
        )

        Row(
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = onCancel,
                modifier = Modifier.padding(top = 16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF22D3EE)
                )
            ) {
                Text(stringResource(R.string.button_back))
            }
            Button(
                onClick = { onSave(photoPath) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF22D3EE)
                ),
                modifier = Modifier.padding(top = 16.dp)
            ) {
                Text(stringResource(R.string.button_save))
            }
        }
    }
}