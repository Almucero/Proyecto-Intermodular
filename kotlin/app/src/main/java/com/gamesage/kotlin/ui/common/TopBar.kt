package com.gamesage.kotlin.ui.common

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gamesage.kotlin.R
import java.util.Locale
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.DpOffset

@Composable
fun TopBar(
    searchQuery: String = "",
    onSearchQueryChange: (String) -> Unit = {},
    onSearchClick: () -> Unit = {},
    onLogoClick: () -> Unit = {},
    onLanguageClick: (String) -> Unit = {},
    onSearchFocus: () -> Unit = {}
) {
    val focusManager = LocalFocusManager.current
    val isImeVisible = WindowInsets.ime.getBottom(LocalDensity.current) > 0
    val keyboardController = LocalSoftwareKeyboardController.current

    // Efecto para que no se quede parpadeando el buscador cuando el teclado se oculta automáticamente
    LaunchedEffect(isImeVisible) {
        if (!isImeVisible) {
            focusManager.clearFocus()
        }
    }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF030712)) // Fondo muy oscuro para la barra superior
            .pointerInput(Unit) {
                // Detectamos toques fuera del buscador para cerrar el teclado y quitar el foco
                detectTapGestures(onTap = {
                    keyboardController?.hide()
                    focusManager.clearFocus()
                })
            }
    ) {
        Spacer(Modifier.windowInsetsTopHeight(WindowInsets.statusBars))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .height(56.dp)
        ) {
            // Logo de la aplicación a la izquierda
            Image(
                painter = painterResource(id = R.drawable.game_sage_logo),
                contentDescription = "Logo GameSage",
                modifier = Modifier
                    .size(45.dp)
                    .align(Alignment.CenterStart)
                    .clickable { onLogoClick() }
            )

            // Estado para controlar si el buscador tiene el foco (está pulsado)
            var isSearchFocused by remember { mutableStateOf(false) }

            // Buscador (Barra central)
            Box(
                modifier = Modifier
                    .height(40.dp)
                    .width(200.dp)
                    .align(Alignment.Center) // Esto funciona porque está directamente dentro del Box principal
                    // Añadimos el borde dinámico antes del clip
                    .border(
                        width = 1.dp,
                        color = if (isSearchFocused) Color(0xFF93E3FE) else Color.Transparent,
                        shape = RoundedCornerShape(20.dp)
                    )
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1F2937)),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.search),
                        contentDescription = "Buscador",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))

                    // Campo de texto para la búsqueda
                    BasicTextField(
                        value = searchQuery,
                        onValueChange = { newValue ->
                            onSearchQueryChange(newValue) // Notifica el cambio de texto al ViewModel
                        },
                        modifier = Modifier
                            .weight(1f)
                            .onFocusChanged { focusState ->
                                // Actualizamos nuestro estado visual del borde
                                isSearchFocused = focusState.isFocused

                                // Si el usuario toca el buscador, notificamos(si el menu estuviera abierto se cerraria)
                                if (focusState.isFocused) {
                                    onSearchFocus()
                                }
                            },
                        textStyle = TextStyle(
                            color = Color.White,
                            fontSize = 14.sp
                        ),
                        // Configura el teclado para que muestre el botón "Buscar" (Lupa)
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(
                            onSearch = {
                                focusManager.clearFocus() // Cerramos el teclado al buscar
                                onSearchClick()          // Ejecutamos la búsqueda
                            },
                        ),
                        cursorBrush = SolidColor(Color(0xFF93E3FE)),
                        singleLine = true,
                        decorationBox = { innerTextField ->
                            Box(contentAlignment = Alignment.CenterStart) {
                                // Para poner el texto de "Buscar..." cuando no hay nada escrito
                                if (searchQuery.isEmpty()) {
                                    Text(
                                        text = stringResource(R.string.search_placeholder),
                                        color = Color.White.copy(alpha = 0.5f),
                                        fontSize = 14.sp
                                    )
                                }
                                innerTextField()
                            }
                        }
                    )
                }
            }

            // Lista estática de idiomas disponibles
            val languages = remember {
                listOf(
                    Language("es", "Español", R.drawable.espana),
                    Language("en", "English", R.drawable.estados_unidos),
                    Language("de", "Deutsch", R.drawable.alemania),
                    Language("fr", "Français", R.drawable.francia),
                    Language("it", "Italiano", R.drawable.italia)
                )
            }

            // Gestión del menú desplegable de idiomas
            var isLanguageMenuExpanded by remember { mutableStateOf(false) }
            var currentLanguage by remember {
                mutableStateOf(
                    languages.find { it.code == Locale.getDefault().language } ?: languages.first()
                )
            }

            // Selector de idioma (Bandera clickable a la derecha)
            Box(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 8.dp)
            ) {
                Image(
                    painter = painterResource(id = currentLanguage.flagResId),
                    contentDescription = "Idioma ${currentLanguage.name}",
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .clickable { isLanguageMenuExpanded = true }
                )

                // Menú que aparece al pulsar la bandera
                DropdownMenu(
                    expanded = isLanguageMenuExpanded,
                    onDismissRequest = { isLanguageMenuExpanded = false },
                    offset = DpOffset(x = (-10).dp, y = 26.dp),
                    modifier = Modifier
                        .background(Color(0xFF030712))
                        .width(60.dp)
                ) {
                    // Listamos los idiomas que NO son el actual para poder cambiar
                    languages.filter { it.code != currentLanguage.code }.forEach { language ->
                        DropdownMenuItem(
                            text = {
                                Box(
                                    modifier = Modifier.fillMaxWidth(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Image(
                                        painter = painterResource(id = language.flagResId),
                                        contentDescription = language.name,
                                        modifier = Modifier
                                            .size(30.dp)
                                            .clip(RoundedCornerShape(4.dp))
                                    )
                                }
                            },
                            onClick = {
                                currentLanguage = language
                                isLanguageMenuExpanded = false
                                onLanguageClick(language.code) // Cambia el idioma de la app
                            },
                            modifier = Modifier.background(Color(0xFF030712))
                        )
                    }
                }
            }
        }
    }
}

data class Language(
    val code: String,
    val name: String,
    val flagResId: Int
)