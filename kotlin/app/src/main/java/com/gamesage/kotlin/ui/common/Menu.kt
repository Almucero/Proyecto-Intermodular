package com.gamesage.kotlin.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import com.gamesage.kotlin.R
import com.gamesage.kotlin.ui.navigation.Destinations
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Menu(
    navController: NavHostController,
    show: Boolean,
    onDismiss: () -> Unit,
    onClearSearch: () -> Unit
) {
    if (!show) return

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color(0xFF030712),
        dragHandle = null
    ) {
        MenuBottomSheetContent(
            navController = navController,
            onCloseMenu = onDismiss,
            onClearSearch = onClearSearch
        )
    }
}

@Composable
    fun MenuBottomSheetContent(
        navController: NavHostController,
        onCloseMenu: () -> Unit,
        onClearSearch: () -> Unit = {}
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF030712))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF030712))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.menu_title),
                    color = Color(0xFF93E3FE),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF111827))
            ) {

                MenuItemRow(
                    icon = Icons.Default.Search,
                    text = stringResource(R.string.menu_explore),
                    onClick = {
                        onClearSearch()
                        navController.navigate(Destinations.Search.createRoute())
                        onCloseMenu()
                    }
                )
                MenuItemRow(
                    icon = Icons.Default.Settings,
                    text = stringResource(R.string.menu_settings),
                    onClick = { /* TODO */ }
                )
                MenuItemRow(
                    icon = Icons.Default.Info,
                    text = stringResource(R.string.menu_help),
                    onClick = { /* TODO */ }
                )
                MenuItemRow(
                    icon = Icons.Default.Person,
                    text = stringResource(R.string.menu_contact),
                    onClick = {
                        navController.navigate(Destinations.Contact.route)
                        onCloseMenu()
                    }
                )
                MenuItemRow(
                    icon = Icons.Default.Lock,
                    text = stringResource(R.string.menu_privacy),
                    onClick = {
                        navController.navigate(Destinations.Privacy.route)
                        onCloseMenu()
                    }
                )
                MenuItemRow(
                    icon = Icons.Default.List,
                    text = stringResource(R.string.menu_terms),
                    onClick = {
                        navController.navigate(Destinations.Terms.route)
                        onCloseMenu()
                    }
                )
                MenuItemRow(
                    icon = Icons.Default.Star,
                    text = stringResource(R.string.menu_cookies),
                    onClick = {
                        navController.navigate(Destinations.Cookies.route)
                        onCloseMenu()
                    }
                )
            }

            Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
            HomeBottomBar(
                onMenuClick = onCloseMenu,
                onCartClick = {
                    navController.navigate(Destinations.Cart.route)
                    onCloseMenu()
                }
            )
        }
    }

    @Composable
    fun MenuItemRow(
        icon: ImageVector,
        text: String,
        onClick: () -> Unit
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = text,
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = text,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Normal
            )
        }
        Divider(color = Color(0xFF4A4A4A), thickness = 1.dp)
    }