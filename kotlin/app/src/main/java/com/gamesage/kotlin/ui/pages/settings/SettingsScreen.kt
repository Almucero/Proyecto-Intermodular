package com.gamesage.kotlin.ui.pages.settings

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.gamesage.kotlin.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsScreenViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = Color(0xFF111827)
    ) { innerPadding ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFF22D3EE))
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = stringResource(R.string.settings_title),
                            color = Color(0xFF93E3FE),
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                item {
                    SettingsCard {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = stringResource(R.string.settings_notifications_masterToggle),
                                    color = Color.White,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = stringResource(R.string.settings_notifications_masterToggleHint),
                                    color = Color.Gray,
                                    fontSize = 14.sp
                                )
                            }
                            Switch(
                                checked = uiState.emailNotificationsEnabled,
                                onCheckedChange = { viewModel.onEmailNotificationsToggle(it) },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color(0xFF22D3EE),
                                    checkedTrackColor = Color(0xFF22D3EE).copy(alpha = 0.5f)
                                )
                            )
                        }
                    }
                }

                item {
                    AnimatedVisibility(visible = uiState.emailNotificationsEnabled) {
                        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            Text(
                                text = stringResource(R.string.settings_notifications_deliveryTitle),
                                color = Color(0xFF93E3FE),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            
                            SettingsCard {
                                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                    SettingsTextField(
                                        label = stringResource(R.string.settings_notifications_destinationEmail),
                                        value = uiState.notificationEmail,
                                        onValueChange = viewModel::onNotificationEmailChange,
                                        placeholder = stringResource(R.string.settings_notifications_destinationEmailPlaceholder),
                                        keyboardType = KeyboardType.Email
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Box(modifier = Modifier.weight(1f)) {
                                            SettingsDropdown(
                                                label = stringResource(R.string.settings_notifications_language),
                                                options = listOf(
                                                    "" to stringResource(R.string.settings_notifications_languageAuto),
                                                    "es" to "Español",
                                                    "en" to "English",
                                                    "fr" to "Français",
                                                    "de" to "Deutsch",
                                                    "it" to "Italiano"
                                                ),
                                                selectedOption = uiState.emailNotificationLanguage,
                                                onOptionSelected = viewModel::onLanguageChange
                                            )
                                        }
                                        Box(modifier = Modifier.weight(1f)) {
                                            SettingsDropdown(
                                                label = stringResource(R.string.settings_notifications_frequency),
                                                options = listOf(
                                                    "immediate" to stringResource(R.string.settings_notifications_frequencyImmediate),
                                                    "daily" to stringResource(R.string.settings_notifications_frequencyDaily),
                                                    "weekly" to stringResource(R.string.settings_notifications_frequencyWeekly)
                                                ),
                                                selectedOption = uiState.emailNotificationFrequency,
                                                onOptionSelected = viewModel::onFrequencyChange
                                            )
                                        }
                                    }

                                    SettingsTextField(
                                        label = stringResource(R.string.settings_notifications_recommendationIntervalDays),
                                        value = uiState.emailRecommendationIntervalDays.toString(),
                                        onValueChange = { viewModel.onIntervalChange(it.toIntOrNull() ?: 1) },
                                        keyboardType = KeyboardType.Number
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Box(modifier = Modifier.weight(1f)) {
                                            SettingsTextField(
                                                label = stringResource(R.string.settings_notifications_quietStart),
                                                value = uiState.emailQuietHoursStart.toString(),
                                                onValueChange = { viewModel.onQuietHoursStartChange(it.toIntOrNull() ?: 0) },
                                                keyboardType = KeyboardType.Number
                                            )
                                        }
                                        Box(modifier = Modifier.weight(1f)) {
                                            SettingsTextField(
                                                label = stringResource(R.string.settings_notifications_quietEnd),
                                                value = uiState.emailQuietHoursEnd.toString(),
                                                onValueChange = { viewModel.onQuietHoursEndChange(it.toIntOrNull() ?: 0) },
                                                keyboardType = KeyboardType.Number
                                            )
                                        }
                                        Box(modifier = Modifier.weight(1f)) {
                                            SettingsTextField(
                                                label = stringResource(R.string.settings_notifications_pauseDays),
                                                value = uiState.pauseDays.toString(),
                                                onValueChange = { viewModel.onPauseDaysChange(it.toIntOrNull() ?: 0) },
                                                keyboardType = KeyboardType.Number
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                item {
                    AnimatedVisibility(visible = uiState.emailNotificationsEnabled) {
                        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                            Text(
                                text = stringResource(R.string.settings_notifications_categoriesTitle),
                                color = Color(0xFF93E3FE),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            
                            val topicKeys = listOf(
                                "periodicRecommendations", "cartReminders", "favoriteDiscounts",
                                "backInStock", "categoryNews", "weeklyDigest",
                                "purchaseStatus", "inactiveAccount"
                            )

                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                topicKeys.chunked(1).forEach { rowKeys ->
                                    rowKeys.forEach { key ->
                                        TopicItem(
                                            label = getTopicLabel(key),
                                            checked = uiState.topics[key] ?: true,
                                            onCheckedChange = { viewModel.onTopicToggle(key, it) }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                item {
                    Spacer(Modifier.height(16.dp))
                    
                    if (uiState.error != null) {
                        Text(text = uiState.error!!, color = Color.Red, modifier = Modifier.padding(bottom = 8.dp))
                    }
                    if (uiState.isSaved) {
                        Text(text = stringResource(R.string.settings_notifications_savedOk), color = Color.Green, modifier = Modifier.padding(bottom = 8.dp))
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(
                            onClick = { viewModel.saveSettings() },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !uiState.isSaving,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                            shape = RoundedCornerShape(50)
                        ) {
                            if (uiState.isSaving) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                            } else {
                                Text(stringResource(R.string.settings_notifications_saveButton), color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }

                        if (!uiState.deleteAccountConfirmArmed) {
                            Button(
                                onClick = { viewModel.toggleDeleteConfirmation() },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                                border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.5f)),
                                shape = RoundedCornerShape(50)
                            ) {
                                Text(stringResource(R.string.settings_delete_account), color = Color.Red)
                            }
                        } else {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(50))
                                    .background(Color(0xFF7F1D1D))
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(stringResource(R.string.settings_delete_confirm_msg), color = Color.White, fontSize = 12.sp, modifier = Modifier.weight(1f))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { viewModel.confirmDeleteAccount() },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                        modifier = Modifier.height(32.dp)
                                    ) {
                                        Text(stringResource(R.string.settings_delete_yes), color = Color.White, fontSize = 12.sp)
                                    }
                                    Button(
                                        onClick = { viewModel.toggleDeleteConfirmation() },
                                        colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                        modifier = Modifier.height(32.dp)
                                    ) {
                                        Text(stringResource(R.string.settings_delete_no), color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsCard(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF1F2937).copy(alpha = 0.7f))
            .border(1.dp, Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        content()
    }
}

@Composable
fun SettingsTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    keyboardType: KeyboardType = KeyboardType.Text
) {
    Column {
        Text(text = label, color = Color.Gray, fontSize = 14.sp, modifier = Modifier.padding(bottom = 4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, color = Color.DarkGray) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF3B82F6),
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f),
                cursorColor = Color(0xFF22D3EE)
            ),
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            shape = RoundedCornerShape(8.dp),
            singleLine = true
        )
    }
}

@Composable
fun SettingsDropdown(
    label: String,
    options: List<Pair<String, String>>,
    selectedOption: String,
    onOptionSelected: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = options.find { it.first == selectedOption }?.second ?: selectedOption

    Column {
        Text(text = label, color = Color.Gray, fontSize = 14.sp, modifier = Modifier.padding(bottom = 4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .clip(RoundedCornerShape(8.dp))
                .border(1.dp, Color.Gray.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                .clickable { expanded = true }
                .padding(horizontal = 16.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = selectedLabel, color = Color.White)
                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = Color.Gray)
            }
            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
                modifier = Modifier.background(Color(0xFF111827))
            ) {
                options.forEach { (value, label) ->
                    DropdownMenuItem(
                        text = { Text(label, color = Color.White) },
                        onClick = {
                            onOptionSelected(value)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun TopicItem(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF1F2937).copy(alpha = 0.5f))
            .border(1.dp, Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = Color.White, fontSize = 14.sp)
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(
                checkedColor = Color(0xFF22D3EE),
                uncheckedColor = Color.Gray
            )
        )
    }
}

@Composable
fun getTopicLabel(key: String): String {
    return when (key) {
        "periodicRecommendations" -> stringResource(R.string.settings_notifications_topics_periodicRecommendations)
        "cartReminders" -> stringResource(R.string.settings_notifications_topics_cartReminders)
        "favoriteDiscounts" -> stringResource(R.string.settings_notifications_topics_favoriteDiscounts)
        "backInStock" -> stringResource(R.string.settings_notifications_topics_backInStock)
        "categoryNews" -> stringResource(R.string.settings_notifications_topics_categoryNews)
        "weeklyDigest" -> stringResource(R.string.settings_notifications_topics_weeklyDigest)
        "purchaseStatus" -> stringResource(R.string.settings_notifications_topics_purchaseStatus)
        "inactiveAccount" -> stringResource(R.string.settings_notifications_topics_inactiveAccount)
        else -> key
    }
}