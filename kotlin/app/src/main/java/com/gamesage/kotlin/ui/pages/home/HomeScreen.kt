package com.gamesage.kotlin.ui.pages.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults.buttonColors
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.gamesage.kotlin.R


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    viewModel: HomeScreenViewModel = hiltViewModel(),
    onGameClick: (Long) -> Unit = {},
    onGenreClick: (String) -> Unit = {}
) {
    //Observa el estado y mensajes de error desde el ViewModel.
    val uiState by viewModel.uiState.collectAsState()


    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
    ) {
        //Manejo de los distintos estados de la pantalla.
        when (val state = uiState) {
                is HomeUiState.Initial,
                is HomeUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                    }
                }
                is HomeUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(stringResource(R.string.home_error_loading), color = Color.White)
                            Spacer(Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.retry() },
                                colors = buttonColors(
                                    containerColor = Color(0xFF22D3EE)
                                )
                            ) {
                                Text(stringResource(R.string.home_retry), color = Color.Black)
                            }
                        }
                    }
                }
                is HomeUiState.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(top = 12.dp, bottom = 32.dp)
                    ) {
                        //Sección de categorías (géneros).
                        Spacer(Modifier.height(12.dp))
                        CategorySection(state.categories, onGenreClick)

                        //Listas horizontales de juegos por sección.
                        GameHorizontalList(stringResource(R.string.home_best_sellers), state.bestSellers, onGameClick)
                        GameHorizontalList(stringResource(R.string.home_offers), state.offers, onGameClick)
                        GameHorizontalList(stringResource(R.string.home_top_rated), state.topRated, onGameClick)
                    }
                }
            }
        }
    }


@Composable
fun CategorySection(categories: List<String>, onGenreClick: (String) -> Unit) {
    Row(
        modifier = Modifier
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 12.dp)
    ) {
        categories.forEach { cat ->
            Box(
                modifier = Modifier
                    .padding(end = 10.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Color(0xFF1F2937))
                    .clickable { onGenreClick(cat) }
                    .padding(horizontal = 18.dp, vertical = 8.dp)
            ) {
                Text(cat, color = Color.White)
            }
        }
    }
}

//Lista horizontal de juegos con título.
@Composable
fun GameHorizontalList(title: String, games: List<GameHomeUiState>, onGameClick: (Long) -> Unit) {
    if (games.isNotEmpty()) {
        Column(modifier = Modifier.padding(top = 20.dp)) {

            Text(
                text = title,
                modifier = Modifier.padding(horizontal = 16.dp),
                color = Color(0xFF93E3FE),
                fontWeight = FontWeight.SemiBold
            )

            Spacer(Modifier.height(8.dp))

            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp)
            ) {
                items(games.size) { index ->
                    GameCard(games[index], onGameClick)
                }
            }
        }
    }
}

//Tarjeta individual de juego.
@Composable
fun GameCard(game: GameHomeUiState, onGameClick: (Long) -> Unit) {
    Column(
        modifier = Modifier
            .padding(end = 16.dp)
            .width(150.dp)
            .clickable { onGameClick(game.id) }
    ) {
        Box(
            modifier = Modifier
                .height(110.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF1F2937)),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = game.imageUrl,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                error = ColorPainter(Color(0xFF374151)),
                placeholder = ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(Modifier.height(6.dp))

        Text(
            text = game.title,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        game.price?.let { price ->
            val currentPrice = if (game.isOnSale && game.salePrice != null) game.salePrice else price
            val isFree = currentPrice.toString().toDoubleOrNull() == 0.0
            val priceText = if (isFree) {
                if (game.isOnSale && game.salePrice != null) {
                    stringResource(id = R.string.home_free_sale, price.toString())
                } else {
                    stringResource(id = R.string.home_free)
                }
            } else {
                if (game.isOnSale && game.salePrice != null) {
                    stringResource(id = R.string.home_price_sale, game.salePrice.toString(), price.toString())
                } else {
                    "${price}€"
                }
            }

            Text(
                text = priceText,
                color = if (game.isOnSale) Color(0xFFE57373) else Color.LightGray,
                fontWeight = FontWeight.SemiBold,
                fontSize = MaterialTheme.typography.labelMedium.fontSize
            )
        }
    }
}

