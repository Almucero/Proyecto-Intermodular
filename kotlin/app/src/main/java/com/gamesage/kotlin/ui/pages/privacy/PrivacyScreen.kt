package com.gamesage.kotlin.ui.pages.privacy

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
fun PrivacyScreen(
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
                text = "Política de Privacidad",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF93E3FE),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Fecha de vigencia: Diciembre 2024",
                fontSize = 14.sp,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            InfoBox("En GameSage, tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.")
            
            Spacer(modifier = Modifier.height(24.dp))
            
            SectionTitle("1. Información que Recopilamos")
            SectionText("Recopilamos la siguiente información:")
            BulletPoint("Nombre y dirección de correo electrónico")
            BulletPoint("Información de pago (procesada de forma segura)")
            BulletPoint("Historial de compras y preferencias")
            BulletPoint("Datos de uso y navegación")
            BulletPoint("Dirección IP y datos del dispositivo")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("2. Cómo Usamos tu Información")
            SectionText("Utilizamos tu información para:")
            BulletPoint("Procesar tus pedidos y transacciones")
            BulletPoint("Mejorar nuestros servicios")
            BulletPoint("Enviarte actualizaciones y ofertas (con tu consentimiento)")
            BulletPoint("Cumplir con obligaciones legales")
            BulletPoint("Prevenir fraudes y garantizar la seguridad")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("3. Compartir Información")
            SectionText("No vendemos tu información personal. Solo la compartimos con:")
            BulletPoint("Proveedores de servicios de pago")
            BulletPoint("Servicios de análisis y marketing")
            BulletPoint("Autoridades cuando sea legalmente requerido")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("4. Seguridad de los Datos")
            SectionText("Implementamos medidas de seguridad técnicas y organizativas para proteger tu información.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("5. Tus Derechos")
            SectionText("Tienes derecho a:")
            BulletPoint("Acceder a tus datos personales")
            BulletPoint("Rectificar información incorrecta")
            BulletPoint("Solicitar la eliminación de tus datos")
            BulletPoint("Oponerte al procesamiento de tus datos")
            BulletPoint("Portabilidad de datos")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("6. Cookies")
            SectionText("Utilizamos cookies para mejorar tu experiencia. Consulta nuestra Política de Cookies para más información.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("7. Cambios en esta Política")
            SectionText("Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("8. Contacto")
            SectionText("Para ejercer tus derechos o hacer preguntas sobre privacidad, contáctanos en info.gamesage@gmail.com")
        }
    }
}

@Composable
private fun InfoBox(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Text(text = text, fontSize = 15.sp, color = Color(0xFFD1D5DB), lineHeight = 22.sp)
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        text = title,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        modifier = Modifier.padding(bottom = 8.dp)
    )
}

@Composable
private fun SectionText(text: String) {
    Text(text = text, fontSize = 15.sp, color = Color(0xFFD1D5DB), lineHeight = 22.sp)
}

@Composable
private fun BulletPoint(text: String) {
    Row(modifier = Modifier.padding(start = 16.dp, top = 4.dp)) {
        Text(text = "• ", color = Color(0xFF93E3FE), fontSize = 15.sp)
        Text(text = text, fontSize = 15.sp, color = Color(0xFFD1D5DB))
    }
}