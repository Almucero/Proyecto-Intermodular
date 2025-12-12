package com.gamesage.kotlin.ui.pages.cookies

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CookiesScreen(
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                text = "Política de Cookies",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF93E3FE),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Última actualización: Diciembre 2024",
                fontSize = 14.sp,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 24.dp)
            )

            InfoBox(
                text = "En GameSage utilizamos cookies para mejorar tu experiencia de navegación, personalizar contenido y anuncios, proporcionar funciones de redes sociales y analizar nuestro tráfico."
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            SectionTitle("1. ¿Qué son las cookies?")
            SectionText("Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a recordar tus preferencias y mejorar tu experiencia.")
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle("2. Tipos de cookies que utilizamos")
            
            CookieTypeCard(
                title = "Cookies Esenciales",
                description = "Necesarias para el funcionamiento básico del sitio web."
            )
            
            CookieTypeCard(
                title = "Cookies de Preferencias",
                description = "Recuerdan tus preferencias como idioma y configuración."
            )
            
            CookieTypeCard(
                title = "Cookies Analíticas",
                description = "Nos ayudan a entender cómo usas el sitio para mejorarlo."
            )
            
            CookieTypeCard(
                title = "Cookies de Marketing",
                description = "Personalizan anuncios según tus intereses."
            )
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle("3. Cómo gestionar las cookies")
            SectionText("Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.")
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle("4. Más información")
            SectionText("Para más información sobre nuestra política de cookies, contáctanos en info.gamesage@gmail.com")
        }
    }
}

@Composable
fun InfoBox(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(
            text = text,
            fontSize = 15.sp,
            color = Color(0xFFD1D5DB),
            lineHeight = 22.sp
        )
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(
        text = title,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        modifier = Modifier.padding(bottom = 8.dp)
    )
}

@Composable
fun SectionText(text: String) {
    Text(
        text = text,
        fontSize = 15.sp,
        color = Color(0xFFD1D5DB),
        lineHeight = 22.sp
    )
}

@Composable
fun CookieTypeCard(title: String, description: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .background(Color(0xFF1F2937), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Column {
            Row {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF93E3FE)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                fontSize = 14.sp,
                color = Color(0xFF9CA3AF)
            )
        }
    }
}