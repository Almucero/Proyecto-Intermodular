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
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CookiesScreen(
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
                text = stringResource(R.string.cookies_title),
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF93E3FE),
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = stringResource(R.string.cookies_update),
                fontSize = 14.sp,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 24.dp)
            )

            InfoBox(
                text = stringResource(R.string.cookies_intro)
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            SectionTitle(stringResource(R.string.cookies_section1_title))
            SectionText(stringResource(R.string.cookies_section1_text))
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle(stringResource(R.string.cookies_section2_title))
            
            CookieTypeCard(
                title = stringResource(R.string.cookies_type_essential_title),
                description = stringResource(R.string.cookies_type_essential_desc)
            )
            
            CookieTypeCard(
                title = stringResource(R.string.cookies_type_pref_title),
                description = stringResource(R.string.cookies_type_pref_desc)
            )
            
            CookieTypeCard(
                title = stringResource(R.string.cookies_type_analytics_title),
                description = stringResource(R.string.cookies_type_analytics_desc)
            )
            
            CookieTypeCard(
                title = stringResource(R.string.cookies_type_marketing_title),
                description = stringResource(R.string.cookies_type_marketing_desc)
            )
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle(stringResource(R.string.cookies_section3_title))
            SectionText(stringResource(R.string.cookies_section3_text))
            
            Spacer(modifier = Modifier.height(20.dp))

            SectionTitle(stringResource(R.string.cookies_section4_title))
            SectionText(stringResource(R.string.cookies_section4_text))
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