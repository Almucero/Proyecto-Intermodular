package com.gamesage.kotlin.ui.pages.chat

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
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
import coil3.compose.AsyncImage
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
                    fontStyle = if (isItalic) FontStyle.Italic else null,
                    color = if (isBold) Color(0xFF22D3EE) else Color.Unspecified
                )
                withStyle(style) {
                    if (isBold && j == 0 && i > 0) {
                        val prevPart = boldParts[i - 1]
                        if (!prevPart.endsWith("\n\n")) {
                            if (prevPart.endsWith("\n")) {
                                append("\n")
                            } else {
                                append("\n\n")
                            }
                        }
                    }
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
    isLoggedIn: Boolean,
    onNavigateToLogin: () -> Unit,
    sessionId: Int? = null,
    onGameClick: (Long) -> Unit,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var inputText by remember { mutableStateOf("") }
    var showHistory by remember { mutableStateOf(false) }
    var showLoginDialog by remember { mutableStateOf(false) }

    val focusManager = LocalFocusManager.current
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(sessionId) {
        viewModel.setSessionId(sessionId)
    }

    LaunchedEffect(uiState.sessionId) {
        if (uiState.sessionId != null && isLoggedIn) {
            viewModel.fetchSessions()
        }
    }

    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(it)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(onTap = {
                    keyboardController?.hide()
                    focusManager.clearFocus()
                })
            }
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
                                                    if (isLoggedIn) {
                                                        viewModel.sendMessage(suggestionText)
                                                    } else {
                                                        showLoginDialog = true
                                                    }
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
                                ChatMessageBubble(
                                    message = message,
                                    userAvatarUrl = uiState.userAvatar,
                                    onGameClick = onGameClick
                                )
                                Spacer(modifier = Modifier.height(16.dp))
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
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Box(modifier = Modifier.fillMaxWidth().height(32.dp).background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color(0xFF111827))
                                )
                            ))
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
            }

            ChatInputBar(
                text = inputText,
                onTextChange = { inputText = it },
                onSend = {
                    if (inputText.isNotBlank()) {
                        if (isLoggedIn) {
                            viewModel.sendMessage(inputText)
                            inputText = ""
                        } else {
                            keyboardController?.hide()
                            focusManager.clearFocus()
                            inputText = ""
                            showLoginDialog = true
                        }
                    }
                },
                isHistoryVisible = showHistory,
                onHistoryClick = {
                    if (isLoggedIn) {
                        showHistory = !showHistory
                    } else {
                        keyboardController?.hide()
                        focusManager.clearFocus()
                        showLoginDialog = true
                    }
                }
            )
        }

        if (showLoginDialog) {
            AlertDialog(
                onDismissRequest = { showLoginDialog = false },
                title = {
                    Text(
                        text = stringResource(R.string.product_login_required),
                        color = Color.White,
                        fontSize = 16.sp
                    )
                },
                text = {
                    Text(
                        text = stringResource(R.string.product_login_message),
                        color = Color.LightGray,
                        fontSize = 16.sp
                    )
                },
                containerColor = Color(0xFF1F2937),
                confirmButton = {
                    TextButton(
                        onClick = {
                            showLoginDialog = false
                            onNavigateToLogin()
                        },
                        contentPadding = PaddingValues(vertical = 0.dp, horizontal = 16.dp),
                        modifier = Modifier.heightIn(min = 32.dp)
                    ) {
                        Text(stringResource(R.string.login_title), color = Color(0xFF22D3EE))
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { showLoginDialog = false },
                        contentPadding = PaddingValues(vertical = 0.dp, horizontal = 16.dp),
                        modifier = Modifier.heightIn(min = 32.dp)
                    ) {
                        Text(stringResource(R.string.cancel), color = Color.Gray)
                    }
                }
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
            .background(Color(0xFF030712))
            .padding(top = 16.dp)
            .heightIn(max = 400.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 16.dp),
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

        HorizontalDivider(thickness = 1.dp, color = Color(0xFF4A4A4A))
        LazyColumn(modifier = Modifier.fillMaxWidth()) {
            itemsIndexed(sessions) { index, session ->
                val titleText = session.title ?: stringResource(R.string.aichat_empty_session)

                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSessionSelect(session.id) }
                            .padding(vertical = 12.dp, horizontal = 24.dp)
                    ) {
                        Text(
                            text = titleText.ifBlank { stringResource(R.string.aichat_empty_session) },
                            color = Color.LightGray,
                            fontSize = 16.sp,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    if (index < sessions.lastIndex) {
                        HorizontalDivider(thickness = 1.dp, color = Color(0xFF4A4A4A))
                    }
                }
            }
        }
    }
}

@Composable
fun ChatMessageBubble(
    message: ChatMessage,
    userAvatarUrl: String?,
    onGameClick: (Long) -> Unit
) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        if (!isUser) {
            Image(
                painter = painterResource(id = R.drawable.aichat),
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
                    Spacer(modifier = Modifier.height(16.dp))
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        message.games.forEach { game ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color(0x80111827), RoundedCornerShape(12.dp))
                                    .border(1.dp, Color(0xFF374151), RoundedCornerShape(12.dp))
                                    .clickable { onGameClick(game.id.toLong()) }
                                    .padding(12.dp)
                            ) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        Text(
                                            text = game.title,
                                            color = Color(0xFF67E8F9),
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                                            modifier = Modifier.weight(1f)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0x1A4ADE80), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "${game.price}€",
                                                color = Color(0xFF4ADE80),
                                                fontSize = 12.sp,
                                                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Row {
                                        Text(text = "Géneros: ", color = Color(0xFF6B7280), fontSize = 12.sp)
                                        Text(
                                            text = game.genres,
                                            color = Color(0xFF9CA3AF),
                                            fontSize = 12.sp,
                                            maxLines = 1,
                                            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row {
                                        Text(text = "Plat: ", color = Color(0xFF6B7280), fontSize = 12.sp)
                                        Text(
                                            text = game.platforms,
                                            color = Color(0xFF9CA3AF),
                                            fontSize = 12.sp,
                                            maxLines = 1,
                                            overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (isUser) {
            Spacer(modifier = Modifier.width(8.dp))
            if (!userAvatarUrl.isNullOrEmpty()) {
                val avatarUrl = if (userAvatarUrl.startsWith("http")) userAvatarUrl else userAvatarUrl
                AsyncImage(
                    model = avatarUrl,
                    contentDescription = null,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.Gray),
                    contentScale = ContentScale.Crop
                )
            } else {
                Image(
                    painter = painterResource(id = R.drawable.user),
                    contentDescription = null,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(50))
                )
            }
        }
    }
}

@Composable
fun ChatInputBar(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    onHistoryClick: () -> Unit,
    @Suppress("unused") isHistoryVisible: Boolean
) {
    val keyboardController = LocalSoftwareKeyboardController.current
    val focusManager = LocalFocusManager.current

    HorizontalDivider(Modifier, thickness = 1.dp, color = Color(0xFF4A4A4A))
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF030712))
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(
            onClick = {
                keyboardController?.hide()
                focusManager.clearFocus()
                onHistoryClick()
            },
            modifier = Modifier
                .background(Color(0xFF1F2937), RoundedCornerShape(50))
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
                focusedContainerColor = Color(0xFF111827),
                unfocusedContainerColor = Color(0xFF111827),
                focusedBorderColor = Color(0xFF4A4A4A),
                unfocusedBorderColor = Color(0xFF4A4A4A),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Color(0xFF22D3EE)
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

    HorizontalDivider(Modifier, thickness = 1.dp, color = Color(0xFF4A4A4A))
}