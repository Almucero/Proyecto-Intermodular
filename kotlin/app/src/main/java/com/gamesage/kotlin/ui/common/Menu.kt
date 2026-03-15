package com.gamesage.kotlin.ui.common

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import com.gamesage.kotlin.R
import com.gamesage.kotlin.ui.navigation.Destinations

@Composable
fun Menu(
    navController: NavHostController,
    show: Boolean, // Controla si el menú es visible o no
    onDismiss: () -> Unit, // Acción para cerrar el menú
    onClearSearch: () -> Unit // Limpia el texto de búsqueda antes de navegar
) {
    // Fondo oscuro semitransparente que cubre la pantalla al abrir el menú
    if (show) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f))
                .clickable { onDismiss() } // Si tocas fuera del menú, se cierra
        )
    }

    // Animación de entrada/salida (Desliza desde abajo hacia arriba)
    AnimatedVisibility(
        visible = show,
        enter = slideInVertically(
            initialOffsetY = { fullHeight -> fullHeight },
            animationSpec = tween(durationMillis = 300)
        ) + fadeIn(animationSpec = tween(durationMillis = 300)),
        exit = slideOutVertically(
            targetOffsetY = { fullHeight -> fullHeight },
            animationSpec = tween(durationMillis = 300)
        ) + fadeOut(animationSpec = tween(durationMillis = 300)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize(),
            contentAlignment = Alignment.BottomCenter
        ) {
            // Contenedor real del contenido del menú
            MenuBottomSheetContent(
                navController = navController,
                onCloseMenu = onDismiss,
                onClearSearch = onClearSearch
            )
        }
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
                .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)) // Esquinas redondeadas arriba
                .background(Color(0xFF030712)) // Color muy oscuro a juego con la TopBar
        ) {
            // Cabecera del menú
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF030712))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.menu_title),
                    color = Color(0xFF93E3FE), // Azul GameSage
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            HorizontalDivider(Modifier, thickness = 1.dp, color = Color(0xFF4A4A4A))

            // Lista de opciones de navegación
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF111827))
            ) {
                // Opción: Explorar (Barra de búsqueda)
                MenuItemRow(
                    icon = Icons.Default.Search,
                    text = stringResource(R.string.menu_explore),
                    onClick = {
                        onClearSearch() // Borramos lo que hubiera escrito antes para que no se quede el contemido anterior de la búsqueda
                        navController.navigate(Destinations.Search())
                        onCloseMenu()
                    }
                )

                // TODO: Futura implementación de Ajustes y Ayuda
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

                // Opción: Contacto
                MenuItemRow(
                    icon = Icons.Default.Person,
                    text = stringResource(R.string.menu_contact),
                    onClick = {
                        navController.navigate(Destinations.Contact)
                        onCloseMenu()
                    }
                )

                // Opción: Política de Privacidad
                MenuItemRow(
                    icon = Icons.Default.Lock,
                    text = stringResource(R.string.menu_privacy),
                    onClick = {
                        navController.navigate(Destinations.Privacy)
                        onCloseMenu()
                    }
                )

                // Opción: Términos y Condiciones
                MenuItemRow(
                    icon = Icons.AutoMirrored.Filled.List,
                    text = stringResource(R.string.menu_terms),
                    onClick = {
                        navController.navigate(Destinations.Terms)
                        onCloseMenu()
                    }
                )

                // Opción: Política de Cookies (Sin divisor debajo)
                MenuItemRow(
                    icon = Icons.Default.Star,
                    text = stringResource(R.string.menu_cookies),
                    showDivider = false,
                    onClick = {
                        navController.navigate(Destinations.Cookies)
                        onCloseMenu()
                    }
                )
            }
            HorizontalDivider(Modifier, thickness = 1.dp, color = Color(0xFF4A4A4A))
        }
    }


     //Componente reutilizable para cada fila del menú.
     //Incluye icono, texto e interactividad.

    @Composable
    fun MenuItemRow(
        icon: ImageVector,
        text: String,
        showDivider: Boolean = true,
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
        // Divisor opcional entre filas
        if (showDivider) {
            HorizontalDivider(Modifier, thickness = 1.dp, color = Color(0xFF4A4A4A))
        }
    }
