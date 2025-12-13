package com.gamesage.kotlin.ui.common

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import com.gamesage.kotlin.R
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun TopBar(
    searchQuery: String = "",
    onSearchQueryChange: (String) -> Unit = {},
    onSearchClick: () -> Unit = {},
    onLogoClick: () -> Unit = {},
    onLanguageClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF030712))
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .height(56.dp)
    ) {
        // Logo a la izquierda
        Image(
            painter = painterResource(id = R.drawable.game_sage_logo),
            contentDescription = "Logo GameSage",
            modifier = Modifier
                .size(45.dp)
                .align(Alignment.CenterStart)
                .clickable { onLogoClick() }
        )

        // Buscador centrado (TextField)
        Box(
            modifier = Modifier
                .height(40.dp)
                .width(200.dp) // Adjusted width to fit cart icon
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF1F2937))
                .align(Alignment.Center),
            contentAlignment = Alignment.CenterStart
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.search),
                    contentDescription = "Buscador",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                
                BasicTextField(
                    value = searchQuery,
                    onValueChange = { newValue ->
                        onSearchQueryChange(newValue)
                    },
                    modifier = Modifier.weight(1f),
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 14.sp
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            onSearchClick()
                        }
                    ),
                    cursorBrush = SolidColor(Color(0xFF93E3FE)),
                    singleLine = true,
                    decorationBox = { innerTextField ->
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = "Buscar",
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                        innerTextField()
                    }
                )
            }
        }
    }
}