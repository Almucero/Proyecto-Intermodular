package com.gamesage.kotlin.ui.pages.favorites

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.R
import androidx.compose.ui.res.stringResource

@Composable
fun FavoritesScreen(
    onNavigateBack: () -> Unit,
    onGameClick: (Long) -> Unit,
    viewModel: FavoritesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = Color(0xFF111827)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 24.dp)
            ) {
                Text(
                    text = stringResource(R.string.favorites_title),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF67E8F9),
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp)
                )

                when (val state = uiState) {
                    is FavoritesUiState.Loading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                             CircularProgressIndicator(color = Color(0xFF22D3EE))
                        }
                    }
                    is FavoritesUiState.Empty -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = stringResource(R.string.favorites_empty),
                                color = Color(0xFF9CA3AF),
                                fontSize = 18.sp
                            )
                        }
                    }
                    is FavoritesUiState.Error -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                             Text(
                                text = state.message,
                                color = Color(0xFFF87171),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                    is FavoritesUiState.Success -> {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            items(state.games) { game ->
                                FavoriteHorizontalCard(
                                    game = game,
                                    onGameClick = { onGameClick(game.id.toLong()) },
                                    onAddToCart = { viewModel.addToCart(game) },
                                    onRemove = { viewModel.removeFromFavorites(game.id) }
                                )
                            }
                            
                             item {
                                Spacer(modifier = Modifier.height(32.dp))
                                Button(
                                    onClick = { viewModel.transferAllToCart() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.Transparent,
                                        contentColor = Color(0xFF22D3EE)
                                    ),
                                    border = BorderStroke(2.dp, Color(0xFF22D3EE)),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                        .padding(horizontal = 32.dp) 
                                ) {
                                    Text(
                                        text = stringResource(R.string.favorites_transfer_all),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(32.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FavoriteHorizontalCard(
    game: Game,
    onGameClick: () -> Unit,
    onAddToCart: () -> Unit,
    onRemove: () -> Unit
) {
    val imageUrl = game.media?.firstOrNull()?.url
        ?: "https://via.placeholder.com/600x400"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937), RoundedCornerShape(8.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(128.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF1F2937))
                .clickable { onGameClick() },
            contentAlignment = Alignment.Center
        ) {
             AsyncImage(
                model = imageUrl,
                contentDescription = game.title,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                error = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF374151)),
                placeholder = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(modifier = Modifier.width(16.dp))
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = game.title,
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.clickable { onGameClick() }
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = game.Developer?.name ?: stringResource(R.string.cart_unknown_developer),
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
             Text(
                text = game.platforms?.firstOrNull()?.name ?: stringResource(R.string.cart_unknown_developer),
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp
            )
        }
        
         Spacer(modifier = Modifier.width(16.dp))
        Column(
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxHeight()
        ) {
            Column(horizontalAlignment = Alignment.End) {
                 Text(
                    text = stringResource(R.string.cart_unit_price),
                    color = Color(0xFF9CA3AF),
                    fontSize = 14.sp
                )
                 if (game.isOnSale && game.salePrice != null) {
                    Text(
                        text = "${game.price}€",
                        color = Color(0xFF6B7280),
                        fontSize = 14.sp,
                         style = LocalTextStyle.current.copy(
                            textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                        )
                    )
                     Text(
                        text = "${game.salePrice}€",
                        color = Color(0xFF22D3EE),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                 } else {
                      Text(
                        text = "${game.price}€",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                 }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedIconButton(
                     onClick = onAddToCart,
                     border = BorderStroke(1.dp, Color(0xFF22D3EE)),
                     colors = IconButtonDefaults.outlinedIconButtonColors(
                         contentColor = Color(0xFF22D3EE)
                     ),
                     modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.ShoppingCart,
                        contentDescription = "Añadir al carrito",
                        modifier = Modifier.size(20.dp)
                    )
                }
                 OutlinedIconButton(
                     onClick = onRemove,
                     border = BorderStroke(1.dp, Color(0xFF22D3EE)),
                     colors = IconButtonDefaults.outlinedIconButtonColors(
                         contentColor = Color(0xFF22D3EE)
                     ),
                     modifier = Modifier.size(40.dp)
                ) {
                      Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.Delete,
                        contentDescription = "Eliminar de favoritos",
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun OutlinedIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(8.dp),
    colors: IconButtonColors = IconButtonDefaults.outlinedIconButtonColors(),
    border: BorderStroke? = null,
    interactionSource: androidx.compose.foundation.interaction.MutableInteractionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
    content: @Composable () -> Unit
) {
    androidx.compose.material3.Surface(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        shape = shape,
        color = colors.containerColor,
        contentColor = colors.contentColor,
        border = border,
        interactionSource = interactionSource
    ) {
        Box(contentAlignment = Alignment.Center) {
            content()
        }
    }
}
