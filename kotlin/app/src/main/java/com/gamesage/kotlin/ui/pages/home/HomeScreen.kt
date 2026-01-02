package com.gamesage.kotlin.ui.pages.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.navigation.NavController
import coil3.compose.AsyncImage
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.ui.common.HomeBottomBar
import com.gamesage.kotlin.ui.common.TopBar
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R



@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    viewModel: HomeScreenViewModel = hiltViewModel(),
    onGameClick: (Long) -> Unit = {},
    onGenreClick: (String) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = modifier.fillMaxSize()
    ) {
        when (uiState) {
            UiState.Initial,
            UiState.Loading -> LoadingView()
            UiState.Error -> ErrorView(onRetry = { viewModel.retry() })
            is UiState.Success -> GameStoreContent(
                state = uiState as UiState.Success,
                onGameClick = onGameClick,
                onGenreClick = onGenreClick
            )
        }
    }
}


@Composable
fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = Color.White)
    }
}

@Composable
fun ErrorView(onRetry: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(stringResource(R.string.home_error_loading), color = Color.White)
            Spacer(Modifier.height(16.dp))
            androidx.compose.material3.Button(onClick = onRetry) {
                Text(stringResource(R.string.home_retry))
            }
        }
    }
}


@Composable
fun GameStoreContent(state: UiState.Success, onGameClick: (Long) -> Unit, onGenreClick: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 12.dp, bottom = 32.dp)
    ) {

        CategorySection(state.categories, onGenreClick)
        Spacer(Modifier.height(12.dp))

        GameHorizontalList(stringResource(R.string.home_best_sellers), state.bestSellers, onGameClick)
        GameHorizontalList(stringResource(R.string.home_offers), state.offers, onGameClick)
        GameHorizontalList(stringResource(R.string.home_top_rated), state.topRated, onGameClick)
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
                Text(com.gamesage.kotlin.ui.common.PresentationUtils.getLocalizedGenreName(cat), color = Color.White)
            }
        }
    }
}

@Composable
fun GameHorizontalList(title: String, games: List<Game>, onGameClick: (Long) -> Unit) {
    Column(modifier = Modifier.padding(top = 20.dp)) {

        Text(
            text = title,
            modifier = Modifier.padding(horizontal = 16.dp),
            color = Color(0xFF93E3FE),
            fontWeight = FontWeight.SemiBold
        )

        Spacer(Modifier.height(8.dp))

        if (games.isEmpty()) {
            Text(
                text = stringResource(R.string.home_no_games),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        } else {
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

@Composable
fun GameCard(game: Game, onGameClick: (Long) -> Unit) {
    val imageUrl = game.media?.firstOrNull()?.url
        ?: "https://via.placeholder.com/600x400"

    Column(
        modifier = Modifier
            .padding(end = 16.dp)
            .width(150.dp)
            .clickable { onGameClick(game.id.toLong()) }
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
                model = imageUrl,
                contentDescription = game.media?.firstOrNull()?.altText,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                error = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF374151)),
                placeholder = androidx.compose.ui.graphics.painter.ColorPainter(Color(0xFF1F2937))
            )
        }

        Spacer(Modifier.height(6.dp))

        Text(
            text = game.title,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        game.price?.let {
            Text(
                text = if (game.isOnSale && game.salePrice != null)
                    "${game.salePrice}€ (Antes ${game.price}€)"
                else
                    "${game.price}€",
                color = if (game.isOnSale) Color(0xFFE57373) else Color.LightGray,
                fontWeight = FontWeight.SemiBold,
                fontSize = MaterialTheme.typography.labelMedium.fontSize
            )
        }
    }
}

