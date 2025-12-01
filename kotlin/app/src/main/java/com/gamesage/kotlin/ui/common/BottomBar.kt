package com.gamesage.kotlin.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.gamesage.kotlin.R

@Composable
fun HomeBottomBar(
    modifier: Modifier = Modifier,
    onCartClick: () -> Unit = {},
    onFavoritesClick: () -> Unit = {},
    onProfileClick: () -> Unit = {},
    onAiChatClick: () -> Unit = {}
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xFF030712))
            .padding(vertical = 10.dp, horizontal = 24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            painter = painterResource(id = R.drawable.aichat),
            contentDescription = "AIChat",
            tint = Color.White,
            modifier = Modifier
                .size(32.dp)
                .clickable { onAiChatClick() }
        )

        Icon(
            painter = painterResource(id = R.drawable.cart),
            contentDescription = "Cesta",
            tint = Color.White,
            modifier = Modifier
                .size(32.dp)
                .clickable { onCartClick() }
        )

        Icon(
            painter = painterResource(id = R.drawable.favourites),
            contentDescription = "Favoritos",
            tint = Color.White,
            modifier = Modifier
                .size(32.dp)
                .clickable { onFavoritesClick() }
        )

        Icon(
            painter = painterResource(id = R.drawable.user),
            contentDescription = "Perfil",
            tint = Color.White,
            modifier = Modifier
                .size(32.dp)
                .clickable { onProfileClick() }
        )
    }
}
