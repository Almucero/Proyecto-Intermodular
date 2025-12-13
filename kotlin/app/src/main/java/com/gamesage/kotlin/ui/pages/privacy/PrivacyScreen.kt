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
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R
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
                text = stringResource(R.string.privacy_title),
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF93E3FE),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = stringResource(R.string.privacy_update),
                fontSize = 14.sp,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 24.dp)
            )
            
            InfoBox(stringResource(R.string.privacy_intro))
            
            Spacer(modifier = Modifier.height(24.dp))
            
            SectionTitle(stringResource(R.string.privacy_section1_title))
            SectionText(stringResource(R.string.privacy_section1_text))
            BulletPoint(stringResource(R.string.privacy_section1_bp1))
            BulletPoint(stringResource(R.string.privacy_section1_bp2))
            BulletPoint(stringResource(R.string.privacy_section1_bp3))
            BulletPoint(stringResource(R.string.privacy_section1_bp4))
            BulletPoint(stringResource(R.string.privacy_section1_bp5))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section2_title))
            SectionText(stringResource(R.string.privacy_section2_text))
            BulletPoint(stringResource(R.string.privacy_section2_bp1))
            BulletPoint(stringResource(R.string.privacy_section2_bp2))
            BulletPoint(stringResource(R.string.privacy_section2_bp3))
            BulletPoint(stringResource(R.string.privacy_section2_bp4))
            BulletPoint(stringResource(R.string.privacy_section2_bp5))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section3_title))
            SectionText(stringResource(R.string.privacy_section3_text))
            BulletPoint(stringResource(R.string.privacy_section3_bp1))
            BulletPoint(stringResource(R.string.privacy_section3_bp2))
            BulletPoint(stringResource(R.string.privacy_section3_bp3))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section4_title))
            SectionText(stringResource(R.string.privacy_section4_text))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section5_title))
            SectionText(stringResource(R.string.privacy_section5_text))
            BulletPoint(stringResource(R.string.privacy_section5_bp1))
            BulletPoint(stringResource(R.string.privacy_section5_bp2))
            BulletPoint(stringResource(R.string.privacy_section5_bp3))
            BulletPoint(stringResource(R.string.privacy_section5_bp4))
            BulletPoint(stringResource(R.string.privacy_section5_bp5))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section6_title))
            SectionText(stringResource(R.string.privacy_section6_text))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section7_title))
            SectionText(stringResource(R.string.privacy_section7_text))
            
            Spacer(modifier = Modifier.height(20.dp))
            
            SectionTitle(stringResource(R.string.privacy_section8_title))
            SectionText(stringResource(R.string.privacy_section8_text))
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