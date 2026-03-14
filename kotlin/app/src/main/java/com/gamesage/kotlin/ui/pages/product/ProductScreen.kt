package com.gamesage.kotlin.ui.pages.product

import android.content.Intent
import android.content.Intent.ACTION_VIEW
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration.Companion.LineThrough
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.Game
import java.time.format.DateTimeFormatter
import androidx.core.net.toUri

// Pantalla principal del detalle de un juego. Gestiona el estado global y la navegación.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductScreen(
    gameId: Long,
    onNavigateToLogin: () -> Unit = {},
    viewModel: ProductScreenViewModel = hiltViewModel()
) {
    // Observa el estado de la UI y la lista de media del ViewModel
    val uiState by viewModel.uiState.collectAsState()
    val mediaItems by viewModel.mediaItems.collectAsState()
    // Canal para mostrar mensajes de error breves (tipo toast) en la parte inferior
    val snackbarHostState = remember { SnackbarHostState() }

    // Carga el juego al entrar en la pantalla, usando el ID recibido por parámetro
    LaunchedEffect(gameId) {
        viewModel.loadGame(gameId)
    }

    // Si el estado es Success y hay un error en el estado, lo muestra en el Snackbar y luego lo limpia
    if (uiState is ProductUiState.Success) {
        val state = uiState as ProductUiState.Success
        LaunchedEffect(state.error) {
            state.error?.let { error ->
                snackbarHostState.showSnackbar(
                    message = error,
                    duration = SnackbarDuration.Short
                )
                viewModel.clearError()
            }
        }
    }

    Scaffold(
        containerColor = Color(0xFF111827),
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Muestra un composable distinto según el estado actual
            when (val state = uiState) {
                // Ruedecita de carga
                is ProductUiState.Initial,
                is ProductUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                    }
                }
                is ProductUiState.Error -> ErrorView(onRetry = { viewModel.retry() }) // Pantalla de error con botón reintentar
                is ProductUiState.Success -> {
                    // Si el usuario no está logueado y pulsa carrito/favoritos, redirige al Login
                    LaunchedEffect(state.navigateToLogin) {
                        if (state.navigateToLogin) {
                            viewModel.onNavigationConsumed() // Resetea el flag para evitar bucles
                            onNavigateToLogin()
                        }
                    }

                    // Muestra el contenido real del juego
                    ProductContent(
                        state = state,
                        mediaItems = mediaItems,
                        viewModel = viewModel
                    )
                }
            }
        }
    }
}

// Muestra un mensaje de error y un botón para reintentar la carga del juego
@Composable
fun ErrorView(onRetry: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                stringResource(R.string.product_loading_error),
                color = Color.White,
                fontSize = 16.sp
            )
            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF93E3FE)
                )
            ) {
                Text(stringResource(R.string.product_retry))
            }
        }
    }
}

// Composable principal que orquesta todos los bloques visuales de la pantalla del juego
@Composable
fun ProductContent(
    state: ProductUiState.Success,
    mediaItems: List<MediaItem>,
    viewModel: ProductScreenViewModel
) {
    // Calcula el stock actual según la plataforma seleccionada (o total si no hay ninguna)
    val currentStock = viewModel.getStockForPlatform(state.game, state.selectedPlatform)
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()) // Permite hacer scroll en toda la pantalla
            .padding(16.dp)
    ) {
        GameHeader(state.game, viewModel)         // Título + estrellas de valoración
        Spacer(modifier = Modifier.height(16.dp))
        if (mediaItems.isNotEmpty()) {
            MediaCarousel(                        // Carrusel principal (vídeo/portada)
                mediaItems = mediaItems,
                currentIndex = state.currentMediaIndex,
                onPrevious = { viewModel.previousMedia() },
                onNext = { viewModel.nextMedia() }
            )
            Spacer(modifier = Modifier.height(12.dp))
            MediaThumbnails(                     // Miniaturas clicables para saltar al elemento del carrusel
                mediaItems = mediaItems,
                currentIndex = state.currentMediaIndex,
                onSelect = { viewModel.selectMedia(it) }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        PriceSection(state.game)                 // Precio actual (con tachado si está en oferta)
        Spacer(modifier = Modifier.height(16.dp))
        PlatformSelector(                        // Cuadrícula de plataformas disponibles para elegir
            platforms = viewModel.getSortedPlatforms(),
            selectedPlatform = state.selectedPlatform,
            onSelectPlatform = { viewModel.selectPlatform(it) }
        )
        Spacer(modifier = Modifier.height(16.dp))
        StockIndicator(currentStock)             // Indicador de stock: disponible / bajo / sin stock
        Spacer(modifier = Modifier.height(16.dp))
        ActionButtons(                           // Botones: Comprar ya, Añadir al carrito, Favoritos
            selectedPlatform = state.selectedPlatform,
            stock = currentStock,
            addedToCartSuccess = state.addedToCartSuccess,
            addedToFavoritesSuccess = state.addedToFavoritesSuccess,
            onBuyNow = { viewModel.buyNow() },
            onAddToCart = { viewModel.addToCart() },
            onAddToFavorites = { viewModel.addToFavorites() }
        )
        Spacer(modifier = Modifier.height(18.dp))
        // Descripción larga del juego (justificada)
        Text(
            text = state.game.description ?: stringResource(R.string.product_no_description),
            color = Color(0xFFD1D5DB),
            fontSize = 14.sp,
            lineHeight = 20.sp,
            textAlign = TextAlign.Justify
        )
        Spacer(modifier = Modifier.height(24.dp))
        ScreenshotsSection(                      // Dos capturas de pantalla del juego en paralelo
            screenshot1 = viewModel.getScreenshot1(),
            screenshot2 = viewModel.getScreenshot2()
        )
        Spacer(modifier = Modifier.height(24.dp))
        GameInfoTable(state.game)                // Tabla con desarrollador, editorial, fecha y reembolso
        Spacer(modifier = Modifier.height(32.dp))
    }
}

// Muestra el título del juego y la fila de estrellas de valoración
@Composable
fun GameHeader(game: Game, viewModel: ProductScreenViewModel) {
    Column {
        Text(
            text = game.title,
            color = Color.White,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Pinta tantas estrellas llenas (blancas) como indica el rating del juego
            repeat(viewModel.getRatingStars(game.rating)) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
            // Pinta el resto de estrellas vacías (grises) hasta completar 5
            repeat(viewModel.getEmptyStars(game.rating)) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Color(0xFF6B7280),
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(4.dp))
            // Muestra el valor numérico del rating junto a las estrellas
            Text(
                text = game.rating?.toString() ?: "0.0",
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp
            )
        }
    }
}

// Carrusel principal que muestra el elemento multimedia activo (imagen o vídeo de YouTube)
@Composable
fun MediaCarousel(
    mediaItems: List<MediaItem>,
    currentIndex: Int,
    onPrevious: () -> Unit,
    onNext: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)     // Mantiene la proporción 16:9 (formato vídeo)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.Black)
    ) {
        val currentItem = mediaItems.getOrNull(currentIndex)
        
        if (currentItem != null) {
            when (currentItem.type) {
                // Si el elemento actual es una imagen, la muestra directamente
                MediaType.IMAGE -> {
                    AsyncImage(
                        model = currentItem.url,
                        contentDescription = currentItem.label,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )
                }
                // Si es un vídeo, muestra su miniatura con un botón de Play encima
                // Al pulsar, abre el vídeo en la app de YouTube del móvil
                MediaType.VIDEO -> {
                    val context = LocalContext.current
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable {
                                try {
                                    val intent = Intent(
                                        ACTION_VIEW,
                                        currentItem.url.toUri()
                                    )
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }
                    ) {
                        // Muestra la miniatura del vídeo como fondo
                        currentItem.thumbnail?.let { thumb ->
                            AsyncImage(
                                model = thumb,
                                contentDescription = currentItem.label,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }
                        // Círculo semitransparente con el icono de Play centrado encima
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .align(Alignment.Center)
                                .background(
                                    color = Color.Black.copy(alpha = 0.6f),
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.PlayArrow,
                                contentDescription = "Play video",
                                tint = Color.White,
                                modifier = Modifier.size(48.dp)
                            )
                        }
                    }
                }
            }
        }
        // Flecha izquierda: solo visible si no estamos en el primer elemento
        if (currentIndex > 0) {
            IconButton(
                onClick = onPrevious,
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .padding(8.dp)
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Anterior",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
        // Flecha derecha: solo visible si no estamos en el último elemento
        if (currentIndex < mediaItems.size - 1) {
            IconButton(
                onClick = onNext,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(8.dp)
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Siguiente",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    }
}

// Fila de miniaturas clicables debajo del carrusel. La miniatura activa tiene borde azul y es más grande.
@Composable
fun MediaThumbnails(
    mediaItems: List<MediaItem>,
    currentIndex: Int,
    onSelect: (Int) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center
    ) {
        mediaItems.forEachIndexed { index, item ->
            Box(
                modifier = Modifier
                    .padding(4.dp)
                    .size(width = 96.dp, height = 64.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.Black)
                    .border(
                        // La miniatura activa tiene borde más grueso y azul
                        width = if (index == currentIndex) 4.dp else 2.dp,
                        color = if (index == currentIndex) Color(0xFF93E3FE) else Color(0xFF6B7280),
                        shape = RoundedCornerShape(8.dp)
                    )
                    // La miniatura activa tiene un ligero zoom para destacar
                    .scale(if (index == currentIndex) 1.05f else 0.9f)
                    .clickable { onSelect(index) }
            ) {
                when (item.type) {
                    MediaType.IMAGE -> {
                        AsyncImage(
                            model = item.url,
                            contentDescription = item.label,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                    // Para los vídeos muestra su miniatura con el icono de Play encima
                    MediaType.VIDEO -> {
                        item.thumbnail?.let { thumb ->
                            AsyncImage(
                                model = thumb,
                                contentDescription = item.label,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        Icon(
                            Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier
                                .size(24.dp)
                                .align(Alignment.Center)
                        )
                    }
                }
            }
        }
    }
}

// Muestra el precio del juego. Si está en oferta, muestra el precio de oferta y el original tachado.
@Composable
fun PriceSection(game: Game) {
    Row(
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Decide qué precio mostrar: el de oferta si está en rebaja, o el precio normal
        val displayPrice = if (game.isOnSale && game.salePrice != null) {
            game.salePrice
        } else {
            game.price
        }
        // Precio principal (grande): muestra "Gratis" si es 0, o el precio con € si no
        Text(
            text = if (displayPrice == 0.0) stringResource(R.string.price_free) else "%.2f€".format(displayPrice),
            color = Color.White,
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold
        )
        // Si hay oferta activa, muestra el precio original tachado al lado
        if (game.isOnSale && game.price != null && game.price != 0.0) {
            Text(
                text = "%.2f€".format(game.price),
                color = Color(0xFF6B7280),
                fontSize = 20.sp,
                style = LocalTextStyle.current.copy(
                    textDecoration = LineThrough
                )
            )
        }
    }
}

// Cuadrícula de plataformas disponibles para el juego. Las organiza en filas de 3.
@Composable
fun PlatformSelector(
    platforms: List<PlatformInfo>,
    selectedPlatform: String?,
    onSelectPlatform: (String) -> Unit
) {
    Column {
        Text(
            text = stringResource(R.string.product_platform),
            color = Color(0xFF9CA3AF),
            fontSize = 14.sp
        )
        Spacer(modifier = Modifier.height(12.dp))
        // Primera fila: muestra hasta 3 plataformas
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            platforms.take(3).forEach { platform ->
                PlatformItem(
                    platform = platform,
                    isSelected = selectedPlatform == platform.name,
                    // Solo se puede seleccionar si la plataforma está disponible para este juego
                    onSelect = { if (platform.isAvailable) onSelectPlatform(platform.name) },
                    modifier = Modifier.weight(1f)
                )
            }
        }
        // Segunda fila: muestra el resto de plataformas si hay más de 3
        if (platforms.size > 3) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                platforms.drop(3).forEach { platform ->
                    PlatformItem(
                        platform = platform,
                        isSelected = selectedPlatform == platform.name,
                        onSelect = { if (platform.isAvailable) onSelectPlatform(platform.name) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

// Cuadrito individual de cada plataforma. Cambia su apariencia según si está disponible, seleccionada o sin stock.
@Composable
fun PlatformItem(
    platform: PlatformInfo,
    isSelected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hasStock = platform.stock > 0
    // Una plataforma está habilitada solo si el juego existe en ella Y tiene stock
    val isEnabled = platform.isAvailable && hasStock
    
    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .background(
                when {
                    isSelected && isEnabled -> Color(0xFF374151) // Seleccionada: gris oscuro
                    !hasStock -> Color(0xFF1F1F1F)              // Sin stock: casi negro
                    else -> Color(0xFF1F2937)                   // Normal: gris azulado
                }
            )
            .border(
                // Borde más grueso y azul si está seleccionada, gris oscuro si no tiene stock
                width = if (isSelected && isEnabled) 4.dp else 2.dp,
                color = when {
                    isSelected && isEnabled -> Color(0xFF93E3FE)
                    !hasStock -> Color(0xFF4A4A4A)
                    else -> Color(0xFF6B7280)
                },
                shape = RoundedCornerShape(8.dp)
            )
            .clickable(enabled = isEnabled) { onSelect() }, // Solo clicable si tiene stock
        contentAlignment = Alignment.Center
    ) {
        if (platform.image != 0) {
            // Muestra el logo de la plataforma (opaco si disponible, transparente si sin stock)
            AsyncImage(
                model = platform.image,
                contentDescription = platform.name,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp),
                contentScale = ContentScale.Fit,
                alpha = if (isEnabled) 1f else 0.3f
            )
        } else {
            // Si no hay imagen, muestra el nombre de la plataforma en texto
            Text(
                text = platform.name,
                color = when {
                    isEnabled -> Color.White
                    !hasStock -> Color(0xFF4A4A4A)
                    else -> Color(0xFF6B7280)
                },
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(4.dp)
            )
        }
    }
}

// Indicador visual del nivel de stock con tres estados: disponible (verde), bajo (amarillo) y sin stock (rojo)
@Composable
fun StockIndicator(stock: Int) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth()
    ) {
        // Solo muestra el icono de check si hay bastante stock (más de 20 unidades)
        if (stock > 20) {
            Icon(
                Icons.Default.Check,
                contentDescription = null,
                tint = Color(0xFF10B981),
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
        }
        Text(
            text = when {
                stock > 20 -> stringResource(R.string.product_stock_available) // Verde: "En stock"
                stock > 0 -> stringResource(R.string.product_stock_low)        // Amarillo: "Stock bajo"
                else -> stringResource(R.string.product_stock_out)             // Rojo: "Sin stock"
            },
            color = when {
                stock > 20 -> Color(0xFF10B981) // Verde
                stock > 0 -> Color(0xFFFBBF24)  // Amarillo
                else -> Color(0xFFEF4444)       // Rojo
            },
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

// Los tres botones de acción del juego: Comprar ya, Añadir al carrito y Añadir a favoritos
@Composable
fun ActionButtons(
    selectedPlatform: String?,
    stock: Int,
    addedToCartSuccess: Boolean,
    addedToFavoritesSuccess: Boolean,
    onBuyNow: () -> Unit,
    onAddToCart: () -> Unit,
    onAddToFavorites: () -> Unit
) {
    // Los botones de compra solo están activos si hay plataforma seleccionada Y hay stock
    val isEnabled = selectedPlatform != null && stock > 0
    
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Botón "Comprar ya": muestra un candado si no hay plataforma seleccionada
        Button(
            onClick = onBuyNow,
            enabled = isEnabled,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF93E3FE),
                disabledContainerColor = Color(0xFF93E3FE).copy(alpha = 0.5f)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            if (!isEnabled && selectedPlatform == null) {
                Icon(Icons.Default.Lock, contentDescription = null) // Candado: falta seleccionar plataforma
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(stringResource(R.string.product_buy_now), fontWeight = FontWeight.Bold)
        }
        // Botón "Añadir al carrito": verde con check de confirmación si se añadió con éxito
        Button(
            onClick = onAddToCart,
            enabled = isEnabled,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (addedToCartSuccess) Color(0xFF10B981) else Color(0xFF030712),
                disabledContainerColor = Color(0xFF030712).copy(alpha = 0.5f)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            if (addedToCartSuccess) {
                // Estado tras añadir: icono check + texto de confirmación
                Icon(Icons.Default.Check, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.product_added_to_cart), fontWeight = FontWeight.Bold)
            } else {
                Text(stringResource(R.string.product_add_to_cart), fontWeight = FontWeight.Bold)
            }
        }
        // Botón "Añadir a favoritos": solo requiere plataforma seleccionada (ignora el stock)
        Button(
            onClick = onAddToFavorites,
            enabled = selectedPlatform != null,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (addedToFavoritesSuccess) Color(0xFF10B981) else Color(0xFF030712),
                disabledContainerColor = Color(0xFF030712).copy(alpha = 0.5f)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            if (addedToFavoritesSuccess) {
                // Estado tras añadir: icono check + texto de confirmación
                Icon(Icons.Default.Check, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.product_added_to_cart), fontWeight = FontWeight.Bold)
            } else {
                Text(stringResource(R.string.product_add_to_favorites), fontWeight = FontWeight.Bold)
            }
        }
    }
}

// Muestra las dos capturas de pantalla del juego en paralelo (si existen)
@Composable
fun ScreenshotsSection(screenshot1: String?, screenshot2: String?) {
    // Solo pinta la sección si al menos hay una captura disponible
    if (screenshot1 != null || screenshot2 != null) {
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            screenshot1?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = "Screenshot 1",
                    modifier = Modifier
                        .weight(1f)
                        .aspectRatio(16f / 9f)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            }
            screenshot2?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = "Screenshot 2",
                    modifier = Modifier
                        .weight(1f)
                        .aspectRatio(16f / 9f)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            }
        }
    }
}

// Tabla de información técnica del juego: desarrollador, editorial, fecha y política de reembolso
@Composable
fun GameInfoTable(game: Game) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Color(0xFF6B7280), RoundedCornerShape(8.dp))
    ) {
        InfoRow(stringResource(R.string.product_developer), game.Developer?.name ?: "N/A")
        InfoRow(stringResource(R.string.product_publisher), game.Publisher?.name ?: "N/A")
        InfoRow(stringResource(R.string.product_release_date), game.releaseDate?.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) ?: "N/A")
        InfoRow(stringResource(R.string.product_refundable), if (game.isRefundable) stringResource(R.string.product_yes) else stringResource(R.string.product_no))
    }
}

// Fila de la tabla con una etiqueta (label) a la izquierda y su valor a la derecha
@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF111827))
    ) {
        Text(
            text = label,
            color = Color(0xFF9CA3AF),
            fontSize = 14.sp,
            modifier = Modifier
                .weight(1f)
                .background(Color(0xFF111827))
                .border(
                    width = 1.dp,
                    color = Color(0xFF6B7280)
                )
                .padding(16.dp)
        )
        Text(
            text = value,
            color = Color(0xFFD1D5DB),
            fontSize = 14.sp,
            textAlign = TextAlign.End,
            modifier = Modifier
                .weight(1f)
                .background(Color(0xFF111827))
                .padding(16.dp)
        )
    }
}