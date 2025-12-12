package com.gamesage.kotlin.ui.pages.conditions

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
fun ConditionsScreen(
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
                text = "Términos y Condiciones",
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
            
            InfoBox("Bienvenido a GameSage. Al utilizar nuestros servicios, aceptas estos términos y condiciones.")
            
            Spacer(modifier = Modifier.height(24.dp))
            
            SectionTitle("1. Aceptación de los Términos")
            SectionText("Al acceder y utilizar GameSage, aceptas cumplir con estos términos y condiciones.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("2. Uso del Servicio")
            SectionText("Debes usar GameSage de manera responsable y legal. No está permitido:")
            BulletPoint("Usar el servicio para actividades ilegales")
            BulletPoint("Intentar acceder a cuentas de otros usuarios")
            BulletPoint("Distribuir malware o contenido dañino")
            BulletPoint("Realizar ingeniería inversa del servicio")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("3. Cuentas de Usuario")
            SectionText("Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("4. Compras y Pagos")
            SectionText("Todos los precios están en euros e incluyen IVA. Las compras son finales salvo que se indique lo contrario.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("5. Propiedad Intelectual")
            SectionText("Todo el contenido de GameSage está protegido por derechos de autor y otras leyes de propiedad intelectual.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("6. Limitación de Responsabilidad")
            SectionText("GameSage no se hace responsable de daños indirectos, incidentales o consecuentes derivados del uso del servicio.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("7. Modificaciones")
            SectionText("Nos reservamos el derecho de modificar estos términos en cualquier momento.")
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle("8. Contacto")
            SectionText("Para cualquier pregunta sobre estos términos, contáctanos en info.gamesage@gmail.com")
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