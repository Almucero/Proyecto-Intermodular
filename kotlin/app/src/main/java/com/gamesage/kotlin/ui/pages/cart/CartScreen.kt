package com.gamesage.kotlin.ui.pages.cart

import android.annotation.SuppressLint
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
    //Obtiene el ViewModel usando Hilt.
    viewModel: CartScreenViewModel = hiltViewModel()
) {
    //Observa el StateFlow del ViewModel.
    //Cada vez que el estado cambia, la pantalla se recompone automáticamente.
    val uiState by viewModel.uiState.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    //Para mostrar el Snackbar
    val snackbarHostState = remember { SnackbarHostState() }

    //Escucha cambios en el mensaje de error(cuando no hay internet) y dispara el snackbar
    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            //Limpia el error después de mostrarlo
            viewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = Color(0xFF111827)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            //Título
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

            //Estados de la pantalla
            when (val state = uiState) {
                //Si está cargando o en el inicio, muestra un CircularProgressIndicator
                is CartUiState.Initial, is CartUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                    }
                }
                //Si hay error muestra el mensaje en rojo
                is CartUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            text = state.message,
                            color = Color(0xFFF87171),
                            textAlign = TextAlign.Center
                        )
                    }
                }
                //Si fue bien muestra el carrito.
                is CartUiState.Success -> {
                    //Si el carrito está vacío muestra el texto: "carrito vacío"
                    if (state.items.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                text = stringResource(R.string.cart_empty),
                                color = Color(0xFF9CA3AF),
                                fontSize = 18.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        //Si hay productos
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            //Por cada producto muestra un CartItemRow.
                            //Le pasa: onIncrement, onDecrement,onRemove
                            items(state.items) { item ->
                                CartItemRow(
                                    item = item,
                                    onIncrement = { viewModel.incrementQuantity(item) },
                                    onDecrement = { viewModel.decrementQuantity(item) },
                                    onRemove = { viewModel.removeFromCart(item.gameId, item.platformId) }
                                )
                            }
                        }
                        //Total del carrito en la parte inferior
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
                            //Botón Vaciar carrito
                            OutlinedButton(
                                onClick = { viewModel.clearCart() },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = Color(0xFFF87171)
                                ),
                                border = BorderStroke(1.dp, Color(0xFFF87171)),
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

                            //Botón para pagar
                            Button(
                                onClick = {  },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.Transparent
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .border(2.dp, Color(0xFF93E3FE), RoundedCornerShape(8.dp)),
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

//Cada producto del carrito
@SuppressLint("DefaultLocale")
@Composable
fun CartItemRow(
    item: CartItemUiState,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onRemove: () -> Unit
) {
    
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
                model = item.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                error = ColorPainter(Color(0xFF374151)),
                placeholder = ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        //Muestra:Título y nombre del desarrollador
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = item.title,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = Ellipsis
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = item.developerName,
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp,
                maxLines = 1,
                overflow = Ellipsis
            )
        }
        
        Spacer(modifier = Modifier.width(8.dp))
        //Control de cantidad
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
            //Cantidad actual
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
        //Precio
        Column(horizontalAlignment = Alignment.End) {
             Text(
                text = stringResource(R.string.cart_unit_price),
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp
            )
            //Si está en oferta
            if (item.isOnSale && item.salePrice != null) {
                Text(
                    text = "${item.price}€",
                    color = Color(0xFF6B7280),
                    fontSize = 12.sp,
                    textDecoration = TextDecoration.LineThrough
                )
                Text(
                    text = "${item.salePrice}€",
                    color = Color(0xFF93E3FE),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            } else {
                //Si no está en oferta
                 Text(
                    text = "${item.price}€",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            //Total
             Spacer(modifier = Modifier.height(4.dp))
             Text(
                text = stringResource(R.string.cart_total), 
                color = Color(0xFF93E3FE),
                fontSize = 12.sp
            )
             Text(
                text = String.format("%.2f€", item.itemTotal),
                color = Color(0xFF93E3FE),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        //Botón eliminar
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