package com.gamesage.kotlin.ui.pages.favorites

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons.Default
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextDecoration

@Composable
fun FavoritesScreen(
    onGameClick: (Long) -> Unit,
    // Obtiene el ViewModel usando Hilt.
    viewModel: FavoritesViewModel = hiltViewModel()
) {
    // Observa el StateFlow del ViewModel.
    // Cada vez que el estado cambia, la pantalla se recompone automáticamente.
    val uiState by viewModel.uiState.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    // Para mostrar el Snackbar
    val snackbarHostState = remember { SnackbarHostState() }

    // Escucha cambios en el mensaje de error (cuando no hay internet) y dispara el snackbar
    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            // Limpia el error después de mostrarlo
            viewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
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
                    .background(Color(0xFF111827))
                    .padding(16.dp)
            ) {
                Text(
                    text = stringResource(R.string.favorites_title),
                    color = Color(0xFF93E3FE),
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp),
                    textAlign = TextAlign.Center
                )

                // Estados de la pantalla
                when (val state = uiState) {
                    // Si está cargando o en el inicio, muestra un CircularProgressIndicator
                    is FavoritesUiState.Initial, is FavoritesUiState.Loading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                             CircularProgressIndicator(color = Color(0xFF22D3EE))
                        }
                    }
                    // Si fue bien muestra los favoritos.
                    is FavoritesUiState.Success -> {
                        // Si la lista está vacía muestra el texto: "No tienes favoritos"
                        if (state.games.isEmpty()) {
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
                        } else {
                            // Si hay productos
                            LazyColumn(
                                verticalArrangement = Arrangement.spacedBy(16.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                // Por cada favorito muestra un FavoriteHorizontalCard.
                                items(state.games) { game ->
                                    FavoriteHorizontalCard(
                                        game = game,
                                        onGameClick = { onGameClick(game.gameId.toLong()) },
                                        onAddToCart = { viewModel.addToCart(game) },
                                        onRemove = { viewModel.removeFromFavorites(game.gameId, game.platformId) }
                                    )
                                }

                                // Botón para transferir todo al carrito
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
                    // Si hay error muestra el mensaje en rojo
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
                }
            }
        }
    }
}

// Cada producto de la lista de favoritos
@Composable
fun FavoriteHorizontalCard(
    game: FavoriteItemUiState,
    onGameClick: () -> Unit,
    onAddToCart: () -> Unit,
    onRemove: () -> Unit
) {
    val imageUrl = game.imageUrl

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
                error = ColorPainter(Color(0xFF374151)),
                placeholder = ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(modifier = Modifier.width(16.dp))
        // Muestra: Título, nombre del desarrollador y plataforma
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
                text = game.developerName,
                color = Color.White,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
             Text(
                text = game.platformName,
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        // Precio y acciones
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
                 // Si está en oferta
                 if (game.isOnSale && game.salePrice != null) {
                    Text(
                        text = "${game.price}€",
                        color = Color(0xFF6B7280),
                        fontSize = 14.sp,
                         style = LocalTextStyle.current.copy(
                            textDecoration = TextDecoration.LineThrough
                        )
                    )
                     Text(
                        text = "${game.salePrice}€",
                        color = Color(0xFF22D3EE),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                 } else {
                      // Si no está en oferta
                       Text(
                        text = "${game.price}€",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                 }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            // Botones de acción: Carrito y Eliminar
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
                        imageVector = Default.ShoppingCart,
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
                        imageVector = Default.Delete,
                        contentDescription = "Eliminar de favoritos",
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// Botón de icono personalizado con borde.
// Se utiliza para las acciones de eliminar y añadir al carrito en las tarjetas.
@Composable
fun OutlinedIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    shape: Shape = RoundedCornerShape(8.dp),
    colors: IconButtonColors = IconButtonDefaults.outlinedIconButtonColors(),
    border: BorderStroke? = null,
    interactionSource: MutableInteractionSource = remember { MutableInteractionSource() },
    content: @Composable () -> Unit
) {
    Surface(
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
