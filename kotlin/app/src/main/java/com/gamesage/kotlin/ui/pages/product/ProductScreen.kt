package com.gamesage.kotlin.ui.pages.product

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.runtime.remember
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.data.model.Game
import java.time.format.DateTimeFormatter
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductScreen(
    gameId: Long,
    onNavigateBack: () -> Unit = {},
    onNavigateToLogin: () -> Unit = {},
    viewModel: ProductScreenViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val mediaItems by viewModel.mediaItems.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(gameId) {
        viewModel.loadGame(gameId)
    }

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
            when (val state = uiState) {
                is ProductUiState.Initial,
                is ProductUiState.Loading -> LoadingView()
                is ProductUiState.Error -> ErrorView(onRetry = { viewModel.retry() })
                is ProductUiState.Success -> {
                     ProductContent(
                        state = state,
                        mediaItems = mediaItems,
                        viewModel = viewModel
                    )
                    
                    if (state.showAuthModal) {
                        AuthModal(
                            onDismiss = { viewModel.showAuthModal(false) },
                            onConfirm = { 
                                viewModel.showAuthModal(false)
                                onNavigateToLogin()
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = Color(0xFF93E3FE))
    }
}

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

@Composable
fun ProductContent(
    state: ProductUiState.Success,
    mediaItems: List<MediaItem>,
    viewModel: ProductScreenViewModel
) {
    val currentStock = viewModel.getStockForPlatform(state.game, state.selectedPlatform)
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        GameHeader(state.game, viewModel)
        Spacer(modifier = Modifier.height(16.dp))
        if (mediaItems.isNotEmpty()) {
            MediaCarousel(
                mediaItems = mediaItems,
                currentIndex = state.currentMediaIndex,
                onPrevious = { viewModel.previousMedia() },
                onNext = { viewModel.nextMedia() }
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            MediaThumbnails(
                mediaItems = mediaItems,
                currentIndex = state.currentMediaIndex,
                onSelect = { viewModel.selectMedia(it) }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
        }
        PriceSection(state.game)
        Spacer(modifier = Modifier.height(16.dp))
        PlatformSelector(
            platforms = viewModel.getSortedPlatforms(),
            selectedPlatform = state.selectedPlatform,
            onSelectPlatform = { viewModel.selectPlatform(it) }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        StockIndicator(currentStock)
        
        Spacer(modifier = Modifier.height(16.dp))
        ActionButtons(
            selectedPlatform = state.selectedPlatform,
            stock = currentStock,
            addedToCartSuccess = state.addedToCartSuccess,
            addedToFavoritesSuccess = state.addedToFavoritesSuccess,
            onBuyNow = { viewModel.buyNow() },
            onAddToCart = { viewModel.addToCart() },
            onAddToFavorites = { viewModel.addToFavorites() }
        )
        Spacer(modifier = Modifier.height(18.dp))
        Text(
            text = state.game.description ?: stringResource(R.string.product_no_description),
            color = Color(0xFFD1D5DB),
            fontSize = 14.sp,
            lineHeight = 20.sp,
            textAlign = TextAlign.Justify
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        ScreenshotsSection(
            screenshot1 = viewModel.getScreenshot1(),
            screenshot2 = viewModel.getScreenshot2()
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        GameInfoTable(state.game)
        
        Spacer(modifier = Modifier.height(32.dp))
    }
    if (state.showAuthModal) {
        AuthModal(
            onDismiss = { viewModel.showAuthModal(false) },
            onConfirm = { 
                viewModel.showAuthModal(false)
                // TODO: Navigate to login
            }
        )
    }
}

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
            repeat(viewModel.getRatingStars(game.rating)) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
            repeat(viewModel.getEmptyStars(game.rating)) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = Color(0xFF6B7280),
                    modifier = Modifier.size(16.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(4.dp))
            
            Text(
                text = game.rating?.toString() ?: "0.0",
                color = Color(0xFF9CA3AF),
                fontSize = 14.sp
            )
        }
    }
}

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
            .aspectRatio(16f / 9f)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.Black)
    ) {
        val currentItem = mediaItems.getOrNull(currentIndex)
        
        if (currentItem != null) {
            when (currentItem.type) {
                MediaType.IMAGE -> {
                    AsyncImage(
                        model = currentItem.url,
                        contentDescription = currentItem.label,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit
                    )
                }
                MediaType.VIDEO -> {
                    val context = androidx.compose.ui.platform.LocalContext.current
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable {
                                try {
                                    val intent = android.content.Intent(
                                        android.content.Intent.ACTION_VIEW,
                                        android.net.Uri.parse(currentItem.url)
                                    )
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }
                    ) {
                        currentItem.thumbnail?.let { thumb ->
                            AsyncImage(
                                model = thumb,
                                contentDescription = currentItem.label,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .align(Alignment.Center)
                                .background(
                                    color = Color.Black.copy(alpha = 0.6f),
                                    shape = androidx.compose.foundation.shape.CircleShape
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
        if (currentIndex > 0) {
            IconButton(
                onClick = onPrevious,
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .padding(8.dp)
            ) {
                Icon(
                    Icons.Default.ArrowBack,
                    contentDescription = "Anterior",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
        
        if (currentIndex < mediaItems.size - 1) {
            IconButton(
                onClick = onNext,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(8.dp)
            ) {
                Icon(
                    Icons.Default.ArrowForward,
                    contentDescription = "Siguiente",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    }
}

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
                        width = if (index == currentIndex) 4.dp else 2.dp,
                        color = if (index == currentIndex) Color(0xFF93E3FE) else Color(0xFF6B7280),
                        shape = RoundedCornerShape(8.dp)
                    )
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

@Composable
fun PriceSection(game: Game) {
    Row(
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        val displayPrice = if (game.isOnSale && game.salePrice != null) {
            game.salePrice
        } else {
            game.price
        }
        
        Text(
            text = if (displayPrice == 0.0) stringResource(R.string.price_free) else "%.2f€".format(displayPrice),
            color = Color.White,
            fontSize = 36.sp,
            fontWeight = FontWeight.Bold
        )
        
        if (game.isOnSale && game.price != null && game.price != 0.0) {
            Text(
                text = "%.2f€".format(game.price),
                color = Color(0xFF6B7280),
                fontSize = 20.sp,
                style = LocalTextStyle.current.copy(
                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                )
            )
        }
    }
}

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
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            platforms.take(3).forEach { platform ->
                PlatformItem(
                    platform = platform,
                    isSelected = selectedPlatform == platform.name,
                    onSelect = { if (platform.isAvailable) onSelectPlatform(platform.name) },
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
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

@Composable
fun PlatformItem(
    platform: PlatformInfo,
    isSelected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hasStock = platform.stock > 0
    val isEnabled = platform.isAvailable && hasStock
    
    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .background(
                when {
                    isSelected && isEnabled -> Color(0xFF374151)
                    !hasStock -> Color(0xFF1F1F1F)
                    else -> Color(0xFF1F2937)
                }
            )
            .border(
                width = if (isSelected && isEnabled) 4.dp else 2.dp,
                color = when {
                    isSelected && isEnabled -> Color(0xFF93E3FE)
                    !hasStock -> Color(0xFF4A4A4A)
                    else -> Color(0xFF6B7280)
                },
                shape = RoundedCornerShape(8.dp)
            )
            .clickable(enabled = isEnabled) { onSelect() },
        contentAlignment = Alignment.Center
    ) {
        if (platform.image != 0) {
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

@Composable
fun StockIndicator(stock: Int) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxWidth()
    ) {
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
                stock > 20 -> stringResource(R.string.product_stock_available)
                stock > 0 -> stringResource(R.string.product_stock_low)
                else -> stringResource(R.string.product_stock_out)
            },
            color = when {
                stock > 20 -> Color(0xFF10B981)
                stock > 0 -> Color(0xFFFBBF24)
                else -> Color(0xFFEF4444)
            },
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

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
    val isEnabled = selectedPlatform != null && stock > 0
    
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
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
                Icon(Icons.Default.Lock, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(stringResource(R.string.product_buy_now), fontWeight = FontWeight.Bold)
        }
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
                Icon(Icons.Default.Check, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.product_added_to_cart), fontWeight = FontWeight.Bold)
            } else {
                Text(stringResource(R.string.product_add_to_cart), fontWeight = FontWeight.Bold)
            }
        }

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
                Icon(Icons.Default.Check, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.product_added_to_cart), fontWeight = FontWeight.Bold)
            } else {
                Text(stringResource(R.string.product_add_to_favorites), fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ScreenshotsSection(screenshot1: String?, screenshot2: String?) {
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

@Composable
fun GameInfoTable(game: Game) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, Color(0xFF6B7280), RoundedCornerShape(8.dp))
    ) {
        InfoRow(stringResource(R.string.product_developer), game.Developer?.name ?: "N/A", isFirst = true)
        InfoRow(stringResource(R.string.product_publisher), game.Publisher?.name ?: "N/A")
        InfoRow(stringResource(R.string.product_release_date), game.releaseDate?.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) ?: "N/A")
        InfoRow(stringResource(R.string.product_refundable), if (game.isRefundable) stringResource(R.string.product_yes) else stringResource(R.string.product_no), isLast = true)
    }
}

@Composable
fun InfoRow(label: String, value: String, isFirst: Boolean = false, isLast: Boolean = false) {
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

@Composable
fun AuthModal(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(stringResource(R.string.product_login_required), color = Color.White)
        },
        text = {
            Text(
                stringResource(R.string.product_login_message),
                color = Color(0xFFD1D5DB)
            )
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(stringResource(R.string.product_login_button), color = Color(0xFF93E3FE))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.dashboard_cancel), color = Color(0xFF9CA3AF))
            }
        },
        containerColor = Color(0xFF111827)
    )
}