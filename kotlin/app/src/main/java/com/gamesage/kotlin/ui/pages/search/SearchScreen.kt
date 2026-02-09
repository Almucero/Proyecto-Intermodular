package com.gamesage.kotlin.ui.pages.search

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.data.model.Game
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gamesage.kotlin.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onNavigateBack: () -> Unit,
    onGameClick: (Long) -> Unit,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val selectedPrice by viewModel.selectedPrice.collectAsState()
    val selectedGenre by viewModel.selectedGenre.collectAsState()
    val selectedPlatform by viewModel.selectedPlatform.collectAsState()
    val priceValue by viewModel.priceValue.collectAsState()
    val maxPrice by viewModel.maxPrice.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val genres by viewModel.availableGenres.collectAsStateWithLifecycle()


    var priceExpanded by remember { mutableStateOf(false) }
    var genreExpanded by remember { mutableStateOf(false) }
    var platformExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
    ) {
        when (uiState) {
            is SearchUiState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF22D3EE))
                }
            }
            is SearchUiState.Error -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(stringResource(R.string.search_error), color = Color.White)
                }
            }
            is SearchUiState.Success -> {
                val games = (uiState as SearchUiState.Success).games
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item(span = { GridItemSpan(2) }) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF1F2937), RoundedCornerShape(8.dp))
                                .padding(16.dp)
                        ) {
                            val activeFilters = viewModel.getActiveFilters()
                            if (activeFilters.isNotEmpty()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(stringResource(R.string.search_filters) + " (${activeFilters.size})", color = Color.White, fontWeight = FontWeight.Bold)
                                    TextButton(onClick = { viewModel.resetFilters() }) {
                                        Text(stringResource(R.string.search_reset), color = Color(0xFF93E3FE))
                                    }
                                }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp)
                                        .horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    activeFilters.forEach { filter ->
                                        val label = if (filter.type.startsWith("genre:")) {
                                            filter.label
                                        } else {
                                            filter.label
                                        }
                                        FilterChip(
                                            label = label,
                                            onRemove = { viewModel.removeFilter(filter.type) }
                                        )
                                    }
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            FilterSection(
                                title = stringResource(R.string.filter_price),
                                expanded = priceExpanded,
                                onToggle = { priceExpanded = !priceExpanded }
                            ) {
                                PriceFilterContent(
                                    selectedPrice = selectedPrice,
                                    priceValue = priceValue,
                                    maxPrice = maxPrice,
                                    onSelectPrice = { viewModel.selectPrice(it) },
                                    onPriceChange = { viewModel.updatePriceSlider(it) }
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            FilterSection(
                                title = stringResource(R.string.filter_genre),
                                expanded = genreExpanded,
                                onToggle = { genreExpanded = !genreExpanded }
                            ) {
                                GenreFilterContent(
                                    genres=genres,
                                    selectedGenre = selectedGenre,
                                    onSelectGenre = { viewModel.selectGenre(it) }
                                )
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            FilterSection(
                                title = stringResource(R.string.filter_platform),
                                expanded = platformExpanded,
                                onToggle = { platformExpanded = !platformExpanded }
                            ) {
                                PlatformFilterContent(
                                    selectedPlatform = selectedPlatform,
                                    onSelectPlatform = { viewModel.selectPlatform(it) }
                                )
                            }
                        }
                    }

                    if (games.isEmpty()) {
                        item(span = { GridItemSpan(2) }) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(200.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(stringResource(R.string.search_no_results), color = Color(0xFF9CA3AF), fontSize = 18.sp)
                            }
                        }
                    } else {
                        items(games) { game ->
                            GameCard(game = game, onClick = { onGameClick(game.id.toLong()) })
                        }
                    }
                }
            }
        }
    }
}


@Composable
fun FilterSection(
    title: String,
    expanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF111827))
            .border(1.dp, Color(0xFF374151), RoundedCornerShape(8.dp))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onToggle)
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, color = Color(0xFFD1D5DB), fontWeight = FontWeight.Medium)
            Icon(
                Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint = Color(0xFFD1D5DB),
                modifier = Modifier.rotate(if (expanded) 180f else 0f)
            )
        }
        
        if (expanded) {
            Divider(color = Color(0xFF374151), thickness = 1.dp)
            Box(modifier = Modifier.padding(16.dp)) {
                content()
            }
        }
    }
}

@Composable
fun PriceFilterContent(
    selectedPrice: String,
    priceValue: Int,
    maxPrice: Int,
    onSelectPrice: (String) -> Unit,
    onPriceChange: (Int) -> Unit
) {
    Column {
        val options = listOf(
            "free" to stringResource(R.string.price_free),
            "0-10" to "0-10€",
            "10-20" to "10-20€",
            "20-40" to "20-40€",
            "40+" to "40€+"
        )
        options.forEach { (value, label) ->
            FilterOption(
                label = label,
                selected = selectedPrice == value,
                onClick = { onSelectPrice(value) }
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Divider(color = Color(0xFF374151))
        Spacer(modifier = Modifier.height(16.dp))
        
        Text("${stringResource(R.string.filter_max)} $priceValue€", color = Color(0xFF9CA3AF), fontSize = 14.sp)
        Slider(
            value = priceValue.toFloat(),
            onValueChange = { onPriceChange(it.toInt()) },
            valueRange = 0f..maxPrice.toFloat(),
            colors = SliderDefaults.colors(
                thumbColor = Color(0xFF93E3FE),
                activeTrackColor = Color(0xFF93E3FE),
                inactiveTrackColor = Color(0xFF374151)
            )
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("0€", color = Color(0xFF6B7280), fontSize = 12.sp)
            Text("$maxPrice€", color = Color(0xFF6B7280), fontSize = 12.sp)
        }
    }
}

@Composable
fun GenreFilterContent(
    genres: List<String>,
    selectedGenre: Set<String>,
    onSelectGenre: (String) -> Unit
) {
    Column {
        genres.forEach { genre ->
            FilterOption(
                label = genre,
                selected = selectedGenre.contains(genre),
                onClick = { onSelectGenre(genre) }
            )
        }
    }
}


@Composable
fun PlatformFilterContent(
    selectedPlatform: String,
    onSelectPlatform: (String) -> Unit
) {
    Column {
        listOf("PC", "PS5", "Xbox Series X", "Switch", "PS4", "Xbox One").forEach { platform ->
            FilterOption(
                label = platform,
                selected = selectedPlatform == platform,
                onClick = { onSelectPlatform(platform) }
            )
        }
    }
}

@Composable
fun FilterOption(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            color = if (selected) Color(0xFF93E3FE) else Color(0xFF9CA3AF)
        )
        if (selected) {
            Text("✓", color = Color(0xFF93E3FE))
        }
    }
}

@Composable
fun FilterChip(
    label: String,
    onRemove: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF374151))
            .border(1.dp, Color(0xFF4B5563), RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(label, color = Color(0xFFD1D5DB), fontSize = 14.sp)
            Icon(
                Icons.Default.Close,
                contentDescription = stringResource(R.string.filter_remove),
                tint = Color(0xFFD1D5DB),
                modifier = Modifier
                    .size(16.dp)
                    .clickable(onClick = onRemove)
            )
        }
    }
}

@Composable
fun GameCard(game: Game, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        val imageUrl = game.media?.firstOrNull()?.url
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(0.7f)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF1F2937))
        ) {
            if (imageUrl != null) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = game.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = game.title,
            color = Color.White,
            fontSize = 14.sp,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        
        game.price?.let { price ->
            Text(
                text = if (game.isOnSale && game.salePrice != null) 
                    "${game.salePrice}€" 
                else 
                    "$price€",
                color = if (game.isOnSale) Color(0xFFE57373) else Color(0xFF9CA3AF),
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
