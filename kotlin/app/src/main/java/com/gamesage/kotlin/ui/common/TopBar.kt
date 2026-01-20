package com.gamesage.kotlin.ui.common

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import com.gamesage.kotlin.R
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.Locale

@Composable
fun TopBar(
    searchQuery: String = "",
    onSearchQueryChange: (String) -> Unit = {},
    onSearchClick: () -> Unit = {},
    onLogoClick: () -> Unit = {},
    onLanguageClick: (String) -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF030712))
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .height(56.dp)
    ) {
        Image(
            painter = painterResource(id = R.drawable.game_sage_logo),
            contentDescription = "Logo GameSage",
            modifier = Modifier.size(45.dp).align(Alignment.CenterStart).clickable { onLogoClick() }
        )
        Box(
            modifier = Modifier
                .height(40.dp)
                .width(200.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF1F2937))
                .align(Alignment.Center),
            contentAlignment = Alignment.CenterStart
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.search),
                    contentDescription = "Buscador",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                BasicTextField(
                    value = searchQuery,
                    onValueChange = { newValue ->
                        onSearchQueryChange(newValue)
                    },
                    modifier = Modifier.weight(1f),
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 14.sp
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            onSearchClick()
                        }
                    ),
                    cursorBrush = SolidColor(Color(0xFF93E3FE)),
                    singleLine = true,
                    decorationBox = { innerTextField ->
                        if (searchQuery.isEmpty()) {
                            Text(
                                text = androidx.compose.ui.res.stringResource(R.string.search_placeholder),
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                        innerTextField()
                    }
                )
            }
        }


    val languages = remember<List<Language>> {
        listOf(
            Language("es", "Español", R.drawable.espana),
            Language("en", "English", R.drawable.estados_unidos),
            Language("de", "Deutsch", R.drawable.alemania),
            Language("fr", "Français", R.drawable.francia),
            Language("it", "Italiano", R.drawable.italia)
        )
    }

    var isLanguageMenuExpanded by remember { mutableStateOf(false) }
    var currentLanguage by remember { 
        mutableStateOf(
            languages.find { it.code == Locale.getDefault().language } ?: languages.first()
        ) 
    }

    Box(
        modifier = Modifier.align(Alignment.CenterEnd)
    ) {
        Image(
            painter = painterResource(id = currentLanguage.flagResId),
            contentDescription = "Idioma ${currentLanguage.name}",
            modifier = Modifier
                .size(40.dp)
                .padding(end = 8.dp)
                .clip(RoundedCornerShape(4.dp))
                .clickable { isLanguageMenuExpanded = true }
        )

        DropdownMenu(
            expanded = isLanguageMenuExpanded,
            onDismissRequest = { isLanguageMenuExpanded = false },
            modifier = Modifier
                .background(Color(0xFF030712))
                .width(60.dp)
        ) {
            languages.filter { it.code != currentLanguage.code }.forEach { language ->
                DropdownMenuItem(
                    text = {
                        Image(
                            painter = painterResource(id = language.flagResId),
                            contentDescription = language.name,
                            modifier = Modifier
                                .size(30.dp)
                                .clip(RoundedCornerShape(4.dp))
                        )
                    },
                    onClick = {
                        currentLanguage = language
                        isLanguageMenuExpanded = false
                        onLanguageClick(language.code)
                    },
                    modifier = Modifier.background(Color(0xFF030712))
                )
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