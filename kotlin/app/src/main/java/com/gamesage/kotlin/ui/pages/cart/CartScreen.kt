package com.gamesage.kotlin.ui.pages.cart

import android.annotation.SuppressLint
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonColors
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow.Companion.Ellipsis
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R

@SuppressLint("DefaultLocale")
@Composable
fun CartScreen(
    viewModel: CartScreenViewModel = hiltViewModel(),
    isLoggedIn: Boolean,
    onNavigateToGame: (Int) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Estado del scroll para el efecto de degradado
    val listState = rememberLazyListState()
    val showGradient by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex > 0 || listState.firstVisibleItemScrollOffset > 0
        }
    }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
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
                .background(Color(0xFF111827))
        ) {
            if (!isLoggedIn) {
                // Vista estática para usuario no logueado
                Column(
                    modifier = Modifier.fillMaxSize().padding(
                        top = paddingValues.calculateTopPadding() + 16.dp,
                        bottom = 16.dp, start = 16.dp, end = 16.dp
                    ),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CartHeader()
                    Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                        Text(
                            text = stringResource(R.string.product_login_message),
                            color = Color(0xFF9CA3AF),
                            fontSize = 18.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            } else {
                when (val state = uiState) {
                    is CartUiState.Initial, is CartUiState.Loading -> {
                        Column(
                            modifier = Modifier.fillMaxSize().padding(
                                top = paddingValues.calculateTopPadding() + 16.dp,
                                bottom = 16.dp, start = 16.dp, end = 16.dp
                            )
                        ) {
                            CartHeader()
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = Color(0xFF22D3EE))
                            }
                        }
                    }
                    is CartUiState.Error -> {
                        Column(
                            modifier = Modifier.fillMaxSize().padding(
                                top = paddingValues.calculateTopPadding() + 16.dp,
                                bottom = 16.dp, start = 16.dp, end = 16.dp
                            )
                        ) {
                            CartHeader()
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(text = state.message, color = Color(0xFFF87171), textAlign = TextAlign.Center)
                            }
                        }
                    }
                    is CartUiState.Success -> {
                        if (state.items.isEmpty()) {
                            Column(
                                modifier = Modifier.fillMaxSize().padding(
                                    top = paddingValues.calculateTopPadding() + 16.dp,
                                    bottom = 16.dp, start = 16.dp, end = 16.dp
                                )
                            ) {
                                CartHeader()
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Text(
                                        text = stringResource(R.string.cart_empty),
                                        color = Color(0xFF9CA3AF),
                                        fontSize = 18.sp,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        } else {
                            // Único contenedor de scroll que incluye Título, Items y Footer
                            LazyColumn(
                                state = listState,
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(
                                    start = 16.dp,
                                    end = 16.dp,
                                    top = paddingValues.calculateTopPadding() + 16.dp,
                                    bottom = paddingValues.calculateBottomPadding() + 64.dp
                                ),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // 1. Título scrolleable (se desplaza hacia arriba al mover la lista)
                                item {
                                    CartHeader(modifier = Modifier.padding(bottom = 16.dp))
                                }

                                // 2. Lista de productos
                                items(state.items) { item ->
                                    CartItemRow(
                                        item = item,
                                        onIncrement = { viewModel.incrementQuantity(item) },
                                        onDecrement = { viewModel.decrementQuantity(item) },
                                        onRemove = { viewModel.removeFromCart(item.gameId, item.platformId) },
                                        onClick = { onNavigateToGame(item.gameId) }
                                    )
                                }

                                // 3. Totales y botones scrolleables
                                item {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(top = 16.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = stringResource(R.string.cart_total),
                                                color = Color(0xFF93E3FE),
                                                fontSize = 24.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                text = String.format("%.2f€", state.total),
                                                color = Color(0xFF93E3FE),
                                                fontSize = 24.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }

                                        OutlinedButton(
                                            onClick = { viewModel.clearCart() },
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFF87171)),
                                            border = BorderStroke(1.dp, Color(0xFFF87171)),
                                            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp).height(50.dp),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Delete, null, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(text = stringResource(R.string.cart_clear))
                                        }

                                        Button(
                                            onClick = { viewModel.checkout() },
                                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                                            modifier = Modifier.fillMaxWidth().height(50.dp).border(2.dp, Color(0xFF93E3FE), RoundedCornerShape(8.dp)),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Text(
                                                text = stringResource(R.string.cart_checkout),
                                                color = Color(0xFF93E3FE),
                                                fontSize = 16.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Efecto de degradado superior al hacer scroll (extraído de DashboardScreen.kt)
            if (showGradient) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(paddingValues.calculateTopPadding() + 16.dp)
                        .align(Alignment.TopCenter)
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(Color(0xFF111827), Color.Transparent)
                            )
                        )
                )
            }
        }
    }
}

// Botón de icono personalizado con borde (Copiado de FavoritesScreen para consistencia visual)
@Composable
fun OutlinedIconButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    shape: androidx.compose.ui.graphics.Shape = RoundedCornerShape(8.dp),
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

// Componente para reutilizar el estilo del título
@Composable
fun CartHeader(modifier: Modifier = Modifier) {
    Text(
        text = stringResource(R.string.cart_title),
        color = Color(0xFF93E3FE),
        fontSize = 30.sp,
        fontWeight = FontWeight.Bold,
        modifier = modifier.fillMaxWidth(),
        textAlign = TextAlign.Center
    )
}

//Cada producto del carrito
@SuppressLint("DefaultLocale")
@Composable
fun CartItemRow(
    item: CartItemUiState,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onRemove: () -> Unit,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937), RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(12.dp)
            .height(androidx.compose.foundation.layout.IntrinsicSize.Min)
    ) {
        // COLUMNA IZQUIERDA: Imagen y Controles
        Column(
            modifier = Modifier.width(90.dp)
        ) {
            // Imagen del producto
            Box(
                modifier = Modifier
                    .size(90.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF1F2937)),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    error = ColorPainter(Color(0xFF374151)),
                    placeholder = ColorPainter(Color(0xFF1F2937))
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            // Control de cantidad
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(28.dp)
                    .border(2.dp, Color(0xFF4B5563), RoundedCornerShape(4.dp))
            ) {
                Box(modifier = Modifier.weight(1f).fillMaxHeight().clickable { onDecrement() }, contentAlignment = Alignment.Center) {
                    Text("-", color = Color.White, fontSize = 18.sp)
                }
                Box(modifier = Modifier.width(2.dp).fillMaxHeight().background(Color(0xFF4B5563)))
                Box(modifier = Modifier.weight(1.2f).fillMaxHeight().background(Color(0xFF111827)), contentAlignment = Alignment.Center) {
                    Text(item.quantity.toString(), color = Color.White, fontSize = 14.sp)
                }
                Box(modifier = Modifier.width(2.dp).fillMaxHeight().background(Color(0xFF4B5563)))
                Box(modifier = Modifier.weight(1f).fillMaxHeight().clickable { onIncrement() }, contentAlignment = Alignment.Center) {
                    Text("+", color = Color.White, fontSize = 18.sp)
                }
            }
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Fila Superior (Textos)
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = item.title,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = item.developerName ?: stringResource(R.string.cart_unknown_developer),
                    color = Color(0xFF9CA3AF),
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = Ellipsis
                )
            }
            // Fila Inferior (Papelera y Precios)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                // Botón eliminar (Usa el mismo diseño que en Favoritos para consistencia y target de 40dp)
                OutlinedIconButton(
                    onClick = onRemove,
                    border = BorderStroke(1.dp, Color(0xFFF87171)),
                    colors = IconButtonDefaults.outlinedIconButtonColors(
                        contentColor = Color(0xFFF87171)
                    ),
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = stringResource(R.string.cart_delete),
                        modifier = Modifier.size(20.dp)
                    )
                }
                // Precios
                Column(horizontalAlignment = Alignment.End) {
                    if (item.isOnSale && item.salePrice != null) {
                        Text(
                            text = "${item.price}€",
                            color = Color(0xFF6B7280),
                            fontSize = 12.sp,
                            textDecoration = TextDecoration.LineThrough
                        )
                    }
                    Text(
                        text = String.format("%.2f€", item.itemTotal),
                        color = Color(0xFF93E3FE),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}