package com.gamesage.kotlin.ui.pages.help

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamesage.kotlin.R
import kotlinx.coroutines.launch

@Composable
fun HelpScreen(
    modifier: Modifier = Modifier,
    viewModel: HelpScreenViewModel = viewModel(),
    onContactClick: () -> Unit = {},
    onDashboardClick: () -> Unit = {}
) {
    val expandedFaqs by viewModel.expandedFaqs.collectAsState()
    val isModalVisible by viewModel.isModalVisible.collectAsState()
    val modalImageRes by viewModel.modalImageRes.collectAsState()
    val modalCaption by viewModel.modalCaption.collectAsState()

    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF111827))
    ) {
        LazyColumn(
            state = listState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            item { HelpHeroSection() }

            item {
                TableOfContents(
                    onSectionClick = { index ->
                        coroutineScope.launch {
                            listState.animateScrollToItem(index)
                        }
                    }
                )
            }

            item { ActivationSection(viewModel, onDashboardClick) }

            item {
                PlatformSection(
                    title = stringResource(R.string.help_pc_title),
                    intro = stringResource(R.string.help_pc_intro),
                    subSections = listOf(
                        SubSectionData(
                            title = stringResource(R.string.help_steam_title),
                            imageRes = R.drawable.image2,
                            caption = stringResource(R.string.help_steam_caption),
                            steps = listOf(
                                stringResource(R.string.help_steam_step1),
                                stringResource(R.string.help_steam_step2),
                                stringResource(R.string.help_steam_step3),
                                stringResource(R.string.help_steam_step4),
                                stringResource(R.string.help_steam_step5)
                            )
                        ),
                        SubSectionData(
                            title = stringResource(R.string.help_epic_title),
                            imageRes = R.drawable.image3,
                            caption = stringResource(R.string.help_epic_caption),
                            steps = listOf(
                                stringResource(R.string.help_epic_step1),
                                stringResource(R.string.help_epic_step2),
                                stringResource(R.string.help_epic_step3),
                                stringResource(R.string.help_epic_step4),
                                stringResource(R.string.help_epic_step5)
                            )
                        )
                    ),
                    finalCheckTitle = stringResource(R.string.help_pc_final_check_title),
                    finalCheckItems = listOf(
                        stringResource(R.string.help_pc_final_check_item1),
                        stringResource(R.string.help_pc_final_check_item2),
                        stringResource(R.string.help_pc_final_check_item3)
                    ),
                    viewModel = viewModel,
                    onDashboardClick = onDashboardClick
                )
            }

            item {
                PlatformSection(
                    title = stringResource(R.string.help_ps_title),
                    intro = stringResource(R.string.help_ps_intro),
                    subSections = listOf(
                        SubSectionData(
                            title = stringResource(R.string.help_ps_console_title),
                            imageRes = R.drawable.image4,
                            caption = stringResource(R.string.help_ps_console_caption),
                            steps = listOf(
                                stringResource(R.string.help_ps_console_step1),
                                stringResource(R.string.help_ps_console_step2),
                                stringResource(R.string.help_ps_console_step3),
                                stringResource(R.string.help_ps_console_step4),
                                stringResource(R.string.help_ps_console_step5),
                                stringResource(R.string.help_ps_console_step6)
                            )
                        )
                    ),
                    webTitle = stringResource(R.string.help_ps_web_title),
                    webIntro = stringResource(R.string.help_ps_web_intro),
                    webSteps = listOf(
                        stringResource(R.string.help_ps_web_step1),
                        stringResource(R.string.help_ps_web_step2),
                        stringResource(R.string.help_ps_web_step3)
                    ),
                    viewModel = viewModel,
                    onDashboardClick = onDashboardClick
                )
            }

            item {
                PlatformSection(
                    title = stringResource(R.string.help_xbox_title),
                    intro = stringResource(R.string.help_xbox_intro),
                    subSections = listOf(
                        SubSectionData(
                            title = stringResource(R.string.help_xbox_console_title),
                            imageRes = R.drawable.image5,
                            caption = stringResource(R.string.help_xbox_console_caption),
                            steps = listOf(
                                stringResource(R.string.help_xbox_console_step1),
                                stringResource(R.string.help_xbox_console_step2),
                                stringResource(R.string.help_xbox_console_step3),
                                stringResource(R.string.help_xbox_console_step4),
                                stringResource(R.string.help_xbox_console_step5),
                                stringResource(R.string.help_xbox_console_step6)
                            )
                        )
                    ),
                    webTitle = stringResource(R.string.help_xbox_web_title),
                    webIntro = stringResource(R.string.help_xbox_web_intro),
                    webSteps = listOf(
                        stringResource(R.string.help_xbox_web_step1),
                        stringResource(R.string.help_xbox_web_step2),
                        stringResource(R.string.help_xbox_web_step3),
                        stringResource(R.string.help_xbox_web_step4)
                    ),
                    viewModel = viewModel,
                    onDashboardClick = onDashboardClick
                )
            }

            item {
                PlatformSection(
                    title = stringResource(R.string.help_switch_title),
                    intro = stringResource(R.string.help_switch_intro),
                    subSections = listOf(
                        SubSectionData(
                            title = stringResource(R.string.help_switch_console_title),
                            imageRes = R.drawable.image6,
                            caption = stringResource(R.string.help_switch_console_caption),
                            steps = listOf(
                                stringResource(R.string.help_switch_console_step1),
                                stringResource(R.string.help_switch_console_step2),
                                stringResource(R.string.help_switch_console_step3),
                                stringResource(R.string.help_switch_console_step4),
                                stringResource(R.string.help_switch_console_step5),
                                stringResource(R.string.help_switch_console_step6)
                            )
                        )
                    ),
                    webTitle = stringResource(R.string.help_switch_web_title),
                    webIntro = stringResource(R.string.help_switch_web_intro),
                    webSteps = listOf(
                        stringResource(R.string.help_switch_web_step1),
                        stringResource(R.string.help_switch_web_step2),
                        stringResource(R.string.help_switch_web_step3),
                        stringResource(R.string.help_switch_web_step4)
                    ),
                    viewModel = viewModel,
                    onDashboardClick = onDashboardClick
                )
            }

            item {
                Column(modifier = Modifier.padding(16.dp)) {
                    InfoCard(
                        title = stringResource(R.string.help_final_verification_title),
                        items = listOf(
                            stringResource(R.string.help_final_verification_item1),
                            stringResource(R.string.help_final_verification_item2),
                            stringResource(R.string.help_final_verification_item3)
                        ),
                        backgroundColor = Color(0xFF1E293B),
                        onDashboardClick = onDashboardClick
                    )
                    Spacer(Modifier.height(16.dp))
                    ScreenshotPreview(
                        imageRes = R.drawable.image7,
                        caption = stringResource(R.string.help_final_verification_title),
                        onClick = { viewModel.openScreenshotModal(R.drawable.image7, it) }
                    )
                }
            }

            item {
                FaqSection(
                    expandedStates = expandedFaqs,
                    onToggle = { viewModel.toggleFaq(it) },
                    onDashboardClick = onDashboardClick
                )
            }

            item {
                ContactNote(onContactClick)
            }
        }

        if (isModalVisible && modalImageRes != null) {
            ScreenshotModal(
                imageRes = modalImageRes!!,
                caption = modalCaption,
                onClose = { viewModel.closeScreenshotModal() }
            )
        }
    }
}

@Composable
fun HelpHeroSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = stringResource(R.string.help_title),
            color = Color(0xFF93E3FE),
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = stringResource(R.string.help_hero_description),
            color = Color.LightGray,
            textAlign = TextAlign.Center,
            lineHeight = 22.sp
        )
    }
}

@Composable
fun TableOfContents(onSectionClick: (Int) -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1F2937)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.help_toc_title),
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            Text(
                text = stringResource(R.string.help_toc_description),
                color = Color.Gray,
                fontSize = 14.sp
            )
            Spacer(Modifier.height(12.dp))

            val items = listOf(
                stringResource(R.string.help_nav_activation) to 2,
                stringResource(R.string.help_nav_pc) to 3,
                stringResource(R.string.help_nav_playstation) to 4,
                stringResource(R.string.help_nav_xbox) to 5,
                stringResource(R.string.help_nav_switch) to 6,
                stringResource(R.string.help_nav_faq) to 8
            )

            items.forEach { (label, index) ->
                Text(
                    text = "• $label",
                    color = Color(0xFF22D3EE),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSectionClick(index) }
                        .padding(vertical = 4.dp),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun ActivationSection(viewModel: HelpScreenViewModel, onDashboardClick: () -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        SectionTitle(stringResource(R.string.help_activation_title))
        
        val introStart = stringResource(R.string.help_activation_intro_start)
        val introLink = stringResource(R.string.help_activation_intro_link)
        val introEnd = stringResource(R.string.help_activation_intro_end)

        val annotatedString = buildAnnotatedString {
            append(introStart)
            pushStringAnnotation(tag = "dashboard", annotation = "dashboard")
            withStyle(
                style = SpanStyle(
                    color = Color(0xFF22D3EE),
                    fontWeight = FontWeight.Bold,
                    textDecoration = TextDecoration.Underline
                )
            ) {
                append(introLink)
            }
            pop()
            append(introEnd)
        }

        ClickableText(
            text = annotatedString,
            style = MaterialTheme.typography.bodyMedium.copy(color = Color.White),
            modifier = Modifier.padding(vertical = 8.dp),
            onClick = { offset ->
                annotatedString.getStringAnnotations(tag = "dashboard", start = offset, end = offset)
                    .firstOrNull()?.let {
                        onDashboardClick()
                    }
            }
        )

        InfoCard(
            title = stringResource(R.string.help_before_start_title),
            items = listOf(
                stringResource(R.string.help_before_start_item1),
                stringResource(R.string.help_before_start_item2),
                stringResource(R.string.help_before_start_item3),
                stringResource(R.string.help_before_start_item4)
            ),
            backgroundColor = Color(0xFF0F172A),
            onDashboardClick = onDashboardClick
        )

        Spacer(Modifier.height(16.dp))

        ScreenshotPreview(
            imageRes = R.drawable.image1,
            caption = stringResource(R.string.help_where_key_caption),
            onClick = { viewModel.openScreenshotModal(R.drawable.image1, it) }
        )

        Spacer(Modifier.height(16.dp))

        StepList(
            title = stringResource(R.string.help_global_process_title),
            steps = listOf(
                stringResource(R.string.help_global_process_item1),
                stringResource(R.string.help_global_process_item2),
                stringResource(R.string.help_global_process_item3),
                stringResource(R.string.help_global_process_item4),
                stringResource(R.string.help_global_process_item5),
                stringResource(R.string.help_global_process_item6)
            ),
            onDashboardClick = onDashboardClick
        )

        Spacer(Modifier.height(16.dp))

        ImportantNote(
            title = stringResource(R.string.help_note_title),
            body = stringResource(R.string.help_note_body)
        )
    }
}

data class SubSectionData(
    val title: String,
    val imageRes: Int,
    val caption: String,
    val steps: List<String>
)

@Composable
fun PlatformSection(
    title: String,
    intro: String,
    subSections: List<SubSectionData>,
    webTitle: String? = null,
    webIntro: String? = null,
    webSteps: List<String>? = null,
    finalCheckTitle: String? = null,
    finalCheckItems: List<String>? = null,
    viewModel: HelpScreenViewModel,
    onDashboardClick: (() -> Unit)? = null
) {
    Column(modifier = Modifier.padding(16.dp)) {
        SectionTitle(title)
        Text(text = intro, color = Color.White, modifier = Modifier.padding(vertical = 8.dp))

        subSections.forEach { sub ->
            Spacer(Modifier.height(16.dp))
            Text(text = sub.title, color = Color(0xFF22D3EE), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(Modifier.height(8.dp))
            ScreenshotPreview(
                imageRes = sub.imageRes,
                caption = sub.caption,
                onClick = { viewModel.openScreenshotModal(sub.imageRes, it) }
            )
            Spacer(Modifier.height(8.dp))
            StepList(steps = sub.steps, onDashboardClick = onDashboardClick)
        }

        if (webTitle != null) {
            Spacer(Modifier.height(24.dp))
            Text(text = webTitle, color = Color(0xFF22D3EE), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            if (webIntro != null) {
                Spacer(Modifier.height(8.dp))
                Text(text = webIntro, color = Color.White.copy(alpha = 0.8f))
            }
            if (webSteps != null) {
                Spacer(Modifier.height(12.dp))
                StepList(steps = webSteps, onDashboardClick = onDashboardClick)
            }
        }

        if (finalCheckTitle != null && finalCheckItems != null) {
            Spacer(Modifier.height(24.dp))
            InfoCard(
                title = finalCheckTitle, 
                items = finalCheckItems, 
                backgroundColor = Color(0xFF134E4A),
                onDashboardClick = onDashboardClick
            )
        }
    }
}

@Composable
fun FaqSection(
    expandedStates: Map<Int, Boolean>,
    onToggle: (Int) -> Unit,
    onDashboardClick: (() -> Unit)? = null
) {
    Column(modifier = Modifier.padding(16.dp)) {
        SectionTitle(stringResource(R.string.help_faq_title))

        repeat(16) { i ->
            val index = i + 1
            val q = when(index) {
                1 -> stringResource(R.string.help_faq_q1)
                2 -> stringResource(R.string.help_faq_q2)
                3 -> stringResource(R.string.help_faq_q3)
                4 -> stringResource(R.string.help_faq_q4)
                5 -> stringResource(R.string.help_faq_q5)
                6 -> stringResource(R.string.help_faq_q6)
                7 -> stringResource(R.string.help_faq_q7)
                8 -> stringResource(R.string.help_faq_q8)
                9 -> stringResource(R.string.help_faq_q9)
                10 -> stringResource(R.string.help_faq_q10)
                11 -> stringResource(R.string.help_faq_q11)
                12 -> stringResource(R.string.help_faq_q12)
                13 -> stringResource(R.string.help_faq_q13)
                14 -> stringResource(R.string.help_faq_q14)
                15 -> stringResource(R.string.help_faq_q15)
                16 -> stringResource(R.string.help_faq_q16)
                else -> ""
            }
            val a = when(index) {
                1 -> stringResource(R.string.help_faq_a1)
                2 -> stringResource(R.string.help_faq_a2)
                3 -> stringResource(R.string.help_faq_a3)
                4 -> stringResource(R.string.help_faq_a4)
                5 -> stringResource(R.string.help_faq_a5)
                6 -> stringResource(R.string.help_faq_a6)
                7 -> stringResource(R.string.help_faq_a7)
                8 -> stringResource(R.string.help_faq_a8)
                9 -> stringResource(R.string.help_faq_a9)
                10 -> stringResource(R.string.help_faq_a10)
                11 -> stringResource(R.string.help_faq_a11)
                12 -> stringResource(R.string.help_faq_a12)
                13 -> stringResource(R.string.help_faq_a13)
                14 -> stringResource(R.string.help_faq_a14)
                15 -> stringResource(R.string.help_faq_a15)
                16 -> stringResource(R.string.help_faq_a16)
                else -> ""
            }

            FaqItem(
                question = q,
                answer = a,
                isExpanded = expandedStates[index] ?: false,
                onToggle = { onToggle(index) },
                onDashboardClick = onDashboardClick
            )
        }
    }
}

@Composable
fun FaqItem(
    question: String,
    answer: String,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    onDashboardClick: (() -> Unit)? = null
) {
    val rotation by animateFloatAsState(if (isExpanded) 180f else 0f)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF1F2937))
            .clickable { onToggle() }
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = question,
                color = Color.White,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint = Color(0xFF22D3EE),
                modifier = Modifier.rotate(rotation)
            )
        }
        AnimatedVisibility(visible = isExpanded) {
            Column {
                Spacer(Modifier.height(12.dp))
                HorizontalDivider(color = Color.DarkGray)
                Spacer(Modifier.height(12.dp))
                
                val dashboardText = stringResource(R.string.help_keyword_user_panel)
                val dashboardAltText = stringResource(R.string.help_keyword_dashboard)
                
                if (onDashboardClick != null && (answer.contains(dashboardText, ignoreCase = true) || answer.contains(dashboardAltText, ignoreCase = true))) {
                    val annotatedString = buildAnnotatedString {
                        val targets = listOf(dashboardText, dashboardAltText)
                        val match = targets
                            .map { it to answer.indexOf(it, ignoreCase = true) }
                            .filter { it.second != -1 }
                            .minByOrNull { it.second }
                            
                        if (match != null) {
                            val (target, index) = match
                            append(answer.substring(0, index))
                            pushStringAnnotation(tag = "dashboard", annotation = "dashboard")
                            withStyle(
                                style = SpanStyle(
                                    color = Color(0xFF22D3EE),
                                    fontWeight = FontWeight.Bold,
                                    textDecoration = TextDecoration.Underline
                                )
                            ) {
                                append(answer.substring(index, index + target.length))
                            }
                            pop()
                            append(answer.substring(index + target.length))
                        } else {
                            append(answer)
                        }
                    }
                    
                    ClickableText(
                        text = annotatedString,
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray, lineHeight = 20.sp),
                        onClick = { offset ->
                            annotatedString.getStringAnnotations(tag = "dashboard", start = offset, end = offset)
                                .firstOrNull()?.let {
                                    onDashboardClick()
                                }
                        }
                    )
                } else {
                    Text(text = answer, color = Color.LightGray, lineHeight = 20.sp)
                }
            }
        }
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(
        text = title,
        color = Color(0xFF93E3FE),
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(vertical = 8.dp)
    )
}

@Composable
fun InfoCard(
    title: String,
    items: List<String>,
    backgroundColor: Color,
    onDashboardClick: (() -> Unit)? = null
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, color = Color.White, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            items.forEach { item ->
                Row(modifier = Modifier.padding(vertical = 4.dp)) {
                    Text(text = "•", color = Color(0xFF22D3EE), modifier = Modifier.padding(end = 8.dp))
                    
                    val dashboardText = stringResource(R.string.help_keyword_user_panel)
                    val dashboardAltText = stringResource(R.string.help_keyword_dashboard)
                    
                    if (onDashboardClick != null && (item.contains(dashboardText, ignoreCase = true) || item.contains(dashboardAltText, ignoreCase = true))) {
                        val annotatedString = buildAnnotatedString {
                            
                            val targets = listOf(dashboardText, dashboardAltText)
                            
                            val match = targets
                                .map { it to item.indexOf(it, ignoreCase = true) }
                                .filter { it.second != -1 }
                                .minByOrNull { it.second }
                                
                            if (match != null) {
                                val (target, index) = match
                                append(item.substring(0, index))
                                pushStringAnnotation(tag = "dashboard", annotation = "dashboard")
                                withStyle(
                                    style = SpanStyle(
                                        color = Color(0xFF22D3EE),
                                        fontWeight = FontWeight.Bold,
                                        textDecoration = TextDecoration.Underline
                                    )
                                ) {
                                    append(item.substring(index, index + target.length))
                                }
                                pop()
                                append(item.substring(index + target.length))
                            } else {
                                append(item)
                            }
                        }
                        
                        ClickableText(
                            text = annotatedString,
                            style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray),
                            onClick = { offset ->
                                annotatedString.getStringAnnotations(tag = "dashboard", start = offset, end = offset)
                                    .firstOrNull()?.let {
                                        onDashboardClick()
                                    }
                            }
                        )
                    } else {
                        Text(text = item, color = Color.LightGray, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

@Composable
fun StepList(title: String? = null, steps: List<String>, onDashboardClick: (() -> Unit)? = null) {
    Column {
        if (title != null) {
            Text(text = title, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 8.dp))
        }
        steps.forEachIndexed { index, step ->
            Row(modifier = Modifier.padding(vertical = 4.dp)) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF22D3EE)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = (index + 1).toString(), color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
                Spacer(Modifier.width(12.dp))
                
                val dashboardText = stringResource(R.string.help_keyword_user_panel)
                val dashboardAltText = stringResource(R.string.help_keyword_dashboard)
                
                if (onDashboardClick != null && (step.contains(dashboardText, ignoreCase = true) || step.contains(dashboardAltText, ignoreCase = true))) {
                    val annotatedString = buildAnnotatedString {
                        val targets = listOf(dashboardText, dashboardAltText)
                        val match = targets
                            .map { it to step.indexOf(it, ignoreCase = true) }
                            .filter { it.second != -1 }
                            .minByOrNull { it.second }
                            
                        if (match != null) {
                            val (target, index) = match
                            append(step.substring(0, index))
                            pushStringAnnotation(tag = "dashboard", annotation = "dashboard")
                            withStyle(
                                style = SpanStyle(
                                    color = Color(0xFF22D3EE),
                                    fontWeight = FontWeight.Bold,
                                    textDecoration = TextDecoration.Underline
                                )
                            ) {
                                append(step.substring(index, index + target.length))
                            }
                            pop()
                            append(step.substring(index + target.length))
                        } else {
                            append(step)
                        }
                    }
                    
                    ClickableText(
                        text = annotatedString,
                        style = MaterialTheme.typography.bodyMedium.copy(color = Color.LightGray),
                        onClick = { offset ->
                            annotatedString.getStringAnnotations(tag = "dashboard", start = offset, end = offset)
                                .firstOrNull()?.let {
                                    onDashboardClick()
                                }
                        }
                    )
                } else {
                    Text(text = step, color = Color.LightGray)
                }
            }
        }
    }
}

@Composable
fun ScreenshotPreview(imageRes: Int, caption: String, onClick: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1F2937))
            .clickable { onClick(caption) }
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
        ) {
            androidx.compose.foundation.Image(
                painter = painterResource(id = imageRes),
                contentDescription = caption,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = android.R.drawable.ic_menu_zoom),
                    contentDescription = "Zoom",
                    tint = Color.White,
                    modifier = Modifier.size(48.dp)
                )
            }
        }
        Text(
            text = caption,
            color = Color.Gray,
            fontSize = 12.sp,
            modifier = Modifier.padding(12.dp),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun ImportantNote(title: String, body: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFFFEF3C7).copy(alpha = 0.1f))
            .border(1.dp, Color(0xFFFBBF24).copy(alpha = 0.3f), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(text = title, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text(text = body, color = Color.LightGray, fontSize = 14.sp)
        }
    }
}

@Composable
fun ContactNote(onContactClick: () -> Unit) {
    val startText = stringResource(R.string.help_contact_note_start)
    val linkText = stringResource(R.string.help_contact_note_link)
    val endText = stringResource(R.string.help_contact_note_end)

    val annotatedString = buildAnnotatedString {
        append(startText)
        pushStringAnnotation(tag = "contact", annotation = "contact")
        withStyle(
            style = SpanStyle(
                color = Color(0xFF22D3EE),
                fontWeight = FontWeight.Bold,
                textDecoration = TextDecoration.Underline
            )
        ) {
            append(linkText)
        }
        pop()
        append(endText)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1E293B).copy(alpha = 0.5f))
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = stringResource(R.string.help_contact_note_title),
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(12.dp))
        
        ClickableText(
            text = annotatedString,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = Color.LightGray,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp,
                fontSize = 14.sp
            ),
            onClick = { offset ->
                annotatedString.getStringAnnotations(tag = "contact", start = offset, end = offset)
                    .firstOrNull()?.let {
                        onContactClick()
                    }
            }
        )
    }
}

@Composable
fun ScreenshotModal(imageRes: Int, caption: String, onClose: () -> Unit) {
    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f))
                .clickable { onClose() },
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                androidx.compose.foundation.Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Fit
                )
                Spacer(Modifier.height(16.dp))
                Text(text = caption, color = Color.White, textAlign = TextAlign.Center)
                Spacer(Modifier.height(24.dp))
                Button(
                    onClick = onClose,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF22D3EE))
                ) {
                    Text(text = stringResource(R.string.help_close), color = Color.Black)
                }
            }
        }
    }
}