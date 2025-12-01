package com.gamesage.kotlin.ui.pages.home

import androidx.compose.foundation.background
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import coil3.compose.AsyncImage
import com.gamesage.kotlin.data.model.Game
import com.gamesage.kotlin.ui.common.HomeBottomBar
import com.gamesage.kotlin.ui.common.TopBar


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    viewModel: HomeScreenViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollBehavior = TopAppBarDefaults.pinnedScrollBehavior()

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = { TopBar(scrollBehavior) },
        bottomBar = { HomeBottomBar() },
        containerColor = Color(0xFF111827)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(
                    top = paddingValues.calculateTopPadding(),
                    bottom = paddingValues.calculateBottomPadding()
                )
        ) {
            when (uiState) {
                UiState.Initial,
                UiState.Loading -> LoadingView()
                UiState.Error -> ErrorView()
                is UiState.Success -> GameStoreContent(
                    state = uiState as UiState.Success
                )
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
        CircularProgressIndicator(color = Color.White)
    }
}

@Composable
fun ErrorView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text("Ocurrió un error", color = Color.White)
    }
}

@Composable
fun GameStoreContent(state: UiState.Success) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 12.dp, bottom = 32.dp)
    ) {

        CategorySection(state.categories)
        Spacer(Modifier.height(12.dp))

        GameHorizontalList("Más vendidos", state.bestSellers)
        GameHorizontalList("Ofertas", state.offers)
        GameHorizontalList("Mejor valorados", state.topRated)
    }
}

@Composable
fun CategorySection(categories: List<String>) {
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
                    .padding(horizontal = 18.dp, vertical = 8.dp)
            ) {
                Text(cat, color = Color.White)
            }
        }
    }
}

@Composable
fun GameHorizontalList(title: String, games: List<Game>) {
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
                GameCard(games[index])
            }
        }
    }
}

@Composable
fun GameCard(game: Game) {
    val imageUrl = game.images.firstOrNull()?.url
        ?: "https://via.placeholder.com/600x400"

    Column(
        modifier = Modifier
            .padding(end = 16.dp)
            .width(150.dp)
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = game.images.firstOrNull()?.altText,
            modifier = Modifier
                .height(110.dp)
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp)),
            contentScale = ContentScale.Crop
        )

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

