package com.gamesage.kotlin.ui.pages.chat

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.ChatMessage
import com.gamesage.kotlin.data.model.ChatSession

fun formatMarkdown(text: String): AnnotatedString {
    val cleanedText = text.lines().joinToString("\n") { it.trimStart() }
    return buildAnnotatedString {
        val boldParts = cleanedText.split("**")
        var isBold = false
        for (i in boldParts.indices) {
            val part = boldParts[i]
            val italicParts = part.split("*")
            var isItalic = false
            for (j in italicParts.indices) {
                val subPart = italicParts[j]
                val style = SpanStyle(
                    fontWeight = if (isBold) FontWeight.Bold else null,
                    fontStyle = if (isItalic) FontStyle.Italic else null
                )
                withStyle(style) {
                    append(subPart)
                }
                if (j < italicParts.size - 1) isItalic = !isItalic
            }
            if (i < boldParts.size - 1) isBold = !isBold
        }
    }
}

@Composable
fun ChatScreen(
    sessionId: Int? = null,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var inputText by remember { mutableStateOf("") }
    var showHistory by remember { mutableStateOf(false) }

    LaunchedEffect(sessionId) {
        viewModel.setSessionId(sessionId)
    }

    LaunchedEffect(uiState.sessionId) {
        if (uiState.sessionId != null) {
            viewModel.fetchSessions()
        }
    }

    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(it)
        }
    }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {

            if (uiState.isLoading && uiState.messages.isEmpty()) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFF22D3EE))
                }
            } else {
                Box(modifier = Modifier.weight(1f)) {
                    val listState = rememberLazyListState()
                    val showTopGradient by remember { derivedStateOf { listState.canScrollBackward } }
                    val showBottomGradient by remember { derivedStateOf { listState.canScrollForward } }
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentPadding = PaddingValues(top = 40.dp, bottom = 8.dp),
                        reverseLayout = false
                    ) {
                        if (uiState.messages.isEmpty() && !uiState.isLoading) {
                            item {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = stringResource(id = R.string.aichat_welcome_title),
                                        color = Color.White,
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = stringResource(id = R.string.aichat_welcome_subtitle),
                                        color = Color.Gray,
                                        fontSize = 13.sp,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.padding(horizontal = 24.dp)
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                    
                                    val suggestions = listOf(
                                        R.string.aichat_suggestion_terror,
                                        R.string.aichat_suggestion_rpg,
                                        R.string.aichat_suggestion_ps5
                                    )
                                    
                                    suggestions.forEach { suggestionRes ->
                                        val suggestionText = stringResource(id = suggestionRes)
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(vertical = 5.dp)
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(Color(0xFF1F2937))
                                                .clickable { 
                                                    viewModel.sendMessage(suggestionText) 
                                                }
                                                .padding(12.dp)
                                        ) {
                                            Text(
                                                text = "\"$suggestionText\"",
                                                color = Color.LightGray,
                                                fontSize = 14.sp,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        } else {
                            items(uiState.messages) { message ->
                                ChatMessageBubble(message = message)
                                Spacer(modifier = Modifier.height(24.dp))
                            }
                            if (uiState.isLoading) {
                                item {
                                    Box(modifier = Modifier.fillMaxWidth().padding(8.dp), contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                                    }
                                }
                            }
                        }
                    }
                    

                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(32.dp)
                            .align(Alignment.TopCenter)
                    ) {
                        androidx.compose.animation.AnimatedVisibility(
                            visible = showTopGradient,
                            enter = fadeIn(animationSpec = tween(durationMillis = 400)),
                            exit = fadeOut(animationSpec = tween(durationMillis = 400))
                        ) {
                            Box(modifier = Modifier.fillMaxSize().background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(Color(0xFF111827), Color.Transparent)
                                )
                            ))
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(32.dp)
                            .align(Alignment.BottomCenter)
                    ) {
                        androidx.compose.animation.AnimatedVisibility(
                            visible = !showHistory && showBottomGradient,
                            enter = fadeIn(animationSpec = tween(durationMillis = 400)),
                            exit = fadeOut(animationSpec = tween(durationMillis = 400))
                        ) {
                            Box(modifier = Modifier.fillMaxSize().background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color(0xFF111827))
                                )
                            ))
                        }
                    }

                    if (showHistory) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clickable { showHistory = false }
                        )
                    }

                    androidx.compose.animation.AnimatedVisibility(
                        visible = showHistory,
                        enter = slideInVertically(
                            initialOffsetY = { it },
                            animationSpec = tween(durationMillis = 300)
                        ) + fadeIn(animationSpec = tween(durationMillis = 300)),
                        exit = slideOutVertically(
                            targetOffsetY = { it },
                            animationSpec = tween(durationMillis = 300)
                        ) + fadeOut(animationSpec = tween(durationMillis = 300)),
                        modifier = Modifier.fillMaxWidth().align(Alignment.BottomCenter)
                    ) {
                        ChatHistoryMenuContent(
                            sessions = uiState.sessions,
                            onDismiss = { showHistory = false },
                            onSessionSelect = { id ->
                                viewModel.setSessionId(id)
                                showHistory = false
                            },
                            onNewChat = {
                                viewModel.setSessionId(-1)
                                showHistory = false
                            }
                        )
                    }
                }
            }

            ChatInputBar(
                text = inputText,
                onTextChange = { inputText = it },
                onSend = {
                    if (inputText.isNotBlank()) {
                        viewModel.sendMessage(inputText)
                        inputText = ""
                    }
                },
                onHistoryClick = { showHistory = true }
            )
        }
    }

}

@Composable
fun ChatHistoryMenuContent(
    sessions: List<ChatSession>,
    @Suppress("unused") onDismiss: () -> Unit,
    onSessionSelect: (Int) -> Unit,
    onNewChat: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
            .background(Color(0xFF1F2937))
            .padding(16.dp)
            .heightIn(max = 400.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(R.string.aichat_history),
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = onNewChat) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = stringResource(R.string.aichat_new_chat),
                    tint = Color(0xFF22D3EE)
                )
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        LazyColumn(modifier = Modifier.fillMaxWidth()) {
            items(sessions) { session ->
                val titleText = session.title ?: stringResource(R.string.aichat_empty_session)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onSessionSelect(session.id) }
                        .padding(horizontal = 8.dp, vertical = 12.dp)
                ) {
                    Text(
                        text = titleText.ifBlank { stringResource(R.string.aichat_empty_session) },
                        color = Color.LightGray,
                        fontSize = 16.sp,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}

@Composable
fun ChatMessageBubble(message: ChatMessage) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        if (!isUser) {
            Image(
                painter = androidx.compose.ui.res.painterResource(id = R.drawable.aichat),
                contentDescription = null,
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(50))
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .background(
                    color = if (isUser) Color(0xFF22D3EE) else Color(0xFF1F2937),
                    shape = RoundedCornerShape(12.dp)
                )
                .padding(12.dp)
        ) {
            Column {
                Text(
                    text = formatMarkdown(message.content),
                    color = if (isUser) Color.Black else Color.White,
                    fontSize = 16.sp,
                    lineHeight = 22.sp
                )
                
                if (!message.games.isNullOrEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    message.games.forEach { game ->
                        Text(
                            text = "• ${game.title} - ${game.price}",
                            color = Color(0xFF93E3FE),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(vertical = 2.dp)
                        )
                    }
                }
            }
        }
        if (isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            Image(
                painter = androidx.compose.ui.res.painterResource(id = R.drawable.user),
                contentDescription = null,
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(50))
            )
        }
    }
}

@Composable
fun ChatInputBar(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    onHistoryClick: () -> Unit
) {
    val keyboardController = LocalSoftwareKeyboardController.current
    val focusManager = LocalFocusManager.current

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1F2937))
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(
            onClick = {
                keyboardController?.hide()
                focusManager.clearFocus()
                onHistoryClick()
            }
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.List,
                contentDescription = stringResource(R.string.aichat_history),
                tint = Color.White
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        OutlinedTextField(
            value = text,
            onValueChange = onTextChange,
            modifier = Modifier.weight(1f),
            placeholder = { Text(stringResource(R.string.aichat_input_hint), color = Color.Gray) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF22D3EE),
                unfocusedBorderColor = Color.Transparent,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(24.dp),
            keyboardOptions = KeyboardOptions.Default.copy(
                imeAction = ImeAction.Send
            ),
            keyboardActions = KeyboardActions(
                onSend = { 
                    keyboardController?.hide()
                    focusManager.clearFocus()
                    onSend() 
                }
            )
        )
        Spacer(modifier = Modifier.width(8.dp))
        IconButton(
            onClick = {
                keyboardController?.hide()
                focusManager.clearFocus()
                onSend()
            },
            modifier = Modifier
                .background(Color(0xFF22D3EE), RoundedCornerShape(50))
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Send,
                contentDescription = "Send",
                tint = Color.Black
            )
        }
    }
}
