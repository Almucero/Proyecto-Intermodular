package com.gamesage.kotlin.ui.pages.cart

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.model.Game
import androidx.compose.ui.res.stringResource

@Composable
fun CartScreen(
    onNavigateBack: () -> Unit = {},
    viewModel: CartScreenViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadCart()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
            .padding(16.dp)
    ) {
        Text(
            text = stringResource(R.string.cart_title),
            color = Color(0xFF93E3FE),
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp),
            textAlign = TextAlign.Center
        )

        when {
            uiState.isLoading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF22D3EE))
                }
            }
            uiState.error != null -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = uiState.error ?: stringResource(R.string.cart_unknown_error),
                        color = Color(0xFFF87171),
                        textAlign = TextAlign.Center
                    )
                }
            }
            uiState.cartItems.isEmpty() -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        text = stringResource(R.string.cart_empty),
                        color = Color(0xFF9CA3AF),
                        fontSize = 18.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(uiState.cartItems) { item ->
                        CartItemRow(
                            item = item,
                            onIncrement = { viewModel.incrementQuantity(item) },
                            onDecrement = { viewModel.decrementQuantity(item) },
                            onRemove = { viewModel.removeFromCart(item.gameId, item.platformId) }
                        )
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 32.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = stringResource(R.string.cart_total),
                            color = Color(0xFF9CA3AF),
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = String.format("%.2f€", uiState.total),
                            color = Color(0xFF93E3FE),
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    OutlinedButton(
                        onClick = { viewModel.clearCart() },
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFF87171)
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF87171)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                            .height(50.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = stringResource(R.string.cart_clear))
                    }

                    Button(
                        onClick = { viewModel.checkout() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Transparent
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .border(2.dp, Color(0xFF06B6D4), RoundedCornerShape(8.dp)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = stringResource(R.string.cart_checkout),
                            color = Color(0xFF06B6D4),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onRemove: () -> Unit
) {
    val game = item.game
    val imageUrl = game?.media?.firstOrNull()?.url
        ?: "https://via.placeholder.com/600x400"
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937), RoundedCornerShape(8.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(70.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF1F2937)),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = game?.media?.firstOrNull()?.altText,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                error = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF374151)),
                placeholder = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = game?.title ?: stringResource(R.string.cart_unknown_game),
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = game?.Developer?.name ?: stringResource(R.string.cart_unknown_developer),
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp,
                maxLines = 1,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )
        }
        
        Spacer(modifier = Modifier.width(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
             Box(
                modifier = Modifier
                    .size(32.dp)
                    .border(2.dp, Color(0xFF4B5563), RoundedCornerShape(4.dp))
                    .clickable { onDecrement() },
                contentAlignment = Alignment.Center
            ) {
                 Text("-", color = Color.White, fontSize = 20.sp)
            }
            
            Box(
                modifier = Modifier
                    .size(40.dp, 32.dp)
                    .border(2.dp, Color(0xFF4B5563), RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(item.quantity.toString(), color = Color.White)
            }

            Box(
                modifier = Modifier
                    .size(32.dp)
                    .border(2.dp, Color(0xFF4B5563), RoundedCornerShape(4.dp))
                    .clickable { onIncrement() },
                contentAlignment = Alignment.Center
            ) {
                 Text("+", color = Color.White, fontSize = 20.sp)
            }
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        Column(horizontalAlignment = Alignment.End) {
             Text(
                text = stringResource(R.string.cart_unit_price),
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp
            )
            if (game?.isOnSale == true && game.salePrice != null) {
                Text(
                    text = "${game.price}€",
                    color = Color(0xFF6B7280),
                    fontSize = 12.sp,
                    textDecoration = TextDecoration.LineThrough
                )
                Text(
                    text = "${game.salePrice}€",
                    color = Color(0xFF22D3EE),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            } else {
                 Text(
                    text = "${game?.price ?: 0.0}€",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
             Spacer(modifier = Modifier.height(4.dp))
             val itemTotal = (if (game?.isOnSale == true && game.salePrice != null) game.salePrice else (game?.price ?: 0.0)) * item.quantity
             Text(
                text = stringResource(R.string.cart_total), 
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp
            )
             Text(
                text = String.format("%.2f€", itemTotal),
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        Icon(
            imageVector = Icons.Default.Delete,
            contentDescription = stringResource(R.string.cart_delete),
            tint = Color(0xFFF87171),
            modifier = Modifier
                .clickable { onRemove() }
                .size(24.dp)
        )
    }
}