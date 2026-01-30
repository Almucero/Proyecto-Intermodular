package com.gamesage.kotlin.ui.pages.dashboard

import android.content.Context
import android.graphics.BitmapFactory
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import android.util.Base64
import androidx.camera.compose.CameraXViewfinder
import androidx.camera.core.SurfaceRequest
import androidx.compose.foundation.Image
import androidx.compose.foundation.text.ClickableText
import androidx.compose.ui.graphics.asImageBitmap
import coil3.compose.AsyncImage
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.gamesage.kotlin.R
import java.io.File

@Composable
fun DashboardScreen(
    onPrivacyClick: () -> Unit,
    onLogout: () -> Unit,
    viewModel: DashboardScreenViewModel = hiltViewModel(),
        onNavigateToCamera: () -> Unit,
    lifecycleOwner: LifecycleOwner = LocalLifecycleOwner.current,
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    var showCameraOptions by remember { mutableStateOf(false) }


    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            Toast.makeText(context, it, Toast.LENGTH_LONG).show()
        }
    }

    val imageErrorMessage = stringResource(R.string.dashboard_image_error)
    val copiedMessage = stringResource(R.string.dashboard_copied)
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        uri?.let {
            try {
                val inputStream = context.contentResolver.openInputStream(it)
                val bytes = inputStream?.readBytes()
                inputStream?.close()
                if (bytes != null) {
                    val base64 = Base64.encodeToString(bytes, Base64.DEFAULT)
                    val avatarString = "data:image/jpeg;base64,$base64"
                    viewModel.onEditableDataChange(uiState.editableUser.copy(avatar = avatarString))
                }
            } catch (e: Exception) {
                Toast.makeText(context, imageErrorMessage, Toast.LENGTH_SHORT).show()
            }
        }
    }

    if (uiState.isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFF22D3EE))
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF111827))
                .verticalScroll(rememberScrollState())
                .padding(16.dp, bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = stringResource(R.string.dashboard_user_section),
                fontSize = 30.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA5F3FC),
                modifier = Modifier.padding(vertical = 24.dp)
            )

            Box(
                modifier = Modifier.size(192.dp)
            ) {
                val avatarModel = if (uiState.isEditing) {
                    val avatarUrl = uiState.editableUser.avatar
                    if (!avatarUrl.isNullOrEmpty()) avatarUrl else "https://via.placeholder.com/200"
                } else {
                    val avatarUrl = uiState.user?.avatar
                    if (!avatarUrl.isNullOrEmpty()) avatarUrl else "https://via.placeholder.com/200"
                }

                AsyncImage(
                    model = avatarModel,
                    contentDescription = "User",
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape)
                        .background(Color.Gray),
                    contentScale = ContentScale.Crop
                )
                if (uiState.isEditing) {



                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .size(48.dp)
                            .background(Color(0xFF22D3EE), CircleShape)
                            .clickable {
                                showCameraOptions = true
                            }
                            .padding(12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PhotoCamera,
                            contentDescription = "Change Picture",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                if (showCameraOptions) {

                    AlertDialog(
                        onDismissRequest = { showCameraOptions = false },
                        title = { Text("Foto de perfil") },
                        text = {
                            Column(
                                modifier = Modifier.padding(8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Button(
                                    onClick = {
                                        onNavigateToCamera()
                                    }
                                ) {
                                    Text("Hacer foto")
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Button(
                                    onClick = {
                                        launcher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                                    }
                                ) {
                                    Text("Elegir de galeria")
                                }
                            }
                        },
                        confirmButton = {},
                        dismissButton = {}
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
            Text(
                text = uiState.user?.nickname ?: stringResource(R.string.dashboard_user_placeholder),
                fontSize = 30.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Row(
                modifier = Modifier.padding(top = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "@${uiState.user?.nickname ?: ""}", color = Color(0xFF9CA3AF))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "📄",
                    modifier = Modifier.clickable {
                        clipboardManager.setText(AnnotatedString("@${uiState.user?.nickname}"))
                        Toast.makeText(context, copiedMessage, Toast.LENGTH_SHORT).show()
                    },
                    color = Color.Gray
                )
            }

            Row(
                modifier = Modifier.padding(top = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "ID: ${uiState.user?.id ?: ""}", color = Color(0xFF6B7280), fontSize = 14.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "📄",
                    modifier = Modifier.clickable {
                        clipboardManager.setText(AnnotatedString(uiState.user?.id?.toString() ?: ""))
                        Toast.makeText(context, copiedMessage, Toast.LENGTH_SHORT).show()
                    },
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
            SectionHeader(stringResource(R.string.dashboard_account_info))
            DashboardTextField(
                label = stringResource(R.string.dashboard_username),
                value = uiState.editableUser.nickname,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(nickname = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_email),
                value = uiState.editableUser.email,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(email = it)) },
                isEditing = uiState.isEditing
            )

            Spacer(modifier = Modifier.height(32.dp))
            SectionHeader(stringResource(R.string.dashboard_personal_data))

            val privacyText = stringResource(R.string.dashboard_privacy_text)
            val privacyLink = stringResource(R.string.dashboard_privacy_link)
            val annotatedPrivacyString = buildAnnotatedString {
                append(privacyText)
                pushStringAnnotation(tag = "PRIVACY", annotation = "privacy")
                withStyle(style = SpanStyle(
                    color = Color(0xFF22D3EE),
                    fontWeight = FontWeight.Bold
                )
                ) {
                    append(privacyLink)
                }
                pop()
            }

            ClickableText(
                text = annotatedPrivacyString,
                style = TextStyle(
                    color = Color(0xFF6B7280),
                    fontSize = 14.sp
                ),
                onClick = { offset ->
                    annotatedPrivacyString.getStringAnnotations(tag = "PRIVACY", start = offset, end = offset)
                        .firstOrNull()?.let {
                            onPrivacyClick()
                        }
                },
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            DashboardTextField(
                label = stringResource(R.string.dashboard_name),
                value = uiState.editableUser.name,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(name = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_surname),
                value = uiState.editableUser.surname,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(surname = it)) },
                isEditing = uiState.isEditing
            )

            Spacer(modifier = Modifier.height(32.dp))
            SectionHeader(stringResource(R.string.dashboard_address_section))
            DashboardTextField(
                label = stringResource(R.string.dashboard_address_line1),
                value = uiState.editableUser.addressLine1,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(addressLine1 = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_address_line2),
                value = uiState.editableUser.addressLine2,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(addressLine2 = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_city),
                value = uiState.editableUser.city,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(city = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_region),
                value = uiState.editableUser.region,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(region = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_postal_code),
                value = uiState.editableUser.postalCode,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(postalCode = it)) },
                isEditing = uiState.isEditing
            )
            Spacer(modifier = Modifier.height(16.dp))
            DashboardTextField(
                label = stringResource(R.string.dashboard_country),
                value = uiState.editableUser.country,
                onValueChange = { viewModel.onEditableDataChange(uiState.editableUser.copy(country = it)) },
                isEditing = uiState.isEditing
            )

            Spacer(modifier = Modifier.height(32.dp))
            Row(horizontalArrangement = Arrangement.Center, modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { viewModel.toggleEdit() },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF22D3EE)
                    ),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(if (uiState.isEditing) stringResource(R.string.dashboard_cancel) else stringResource(R.string.dashboard_configure), color = Color.White)
                }

                if (uiState.isEditing) {
                    Spacer(modifier = Modifier.width(16.dp))
                    Button(
                        onClick = { viewModel.saveChanges() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF16A34A)
                        ),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(stringResource(R.string.dashboard_save), color = Color.White)
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFDC2626)
                ),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(stringResource(R.string.dashboard_logout), color = Color.White)
            }

            Spacer(modifier = Modifier.height(32.dp))

        }
    }
}

@Composable
fun SectionHeader(text: String) {
    Text(
        text = text,
        fontSize = 20.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White,
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp)
    )
}

@Composable
fun DashboardTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    isEditing: Boolean
) {
    Column {
        Box(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = value,
                onValueChange = if (isEditing) onValueChange else { _ -> },
                label = { Text(label, color = Color(0xFF9CA3AF)) },
                readOnly = !isEditing,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF22D3EE),
                    unfocusedBorderColor = Color.Transparent,
                    disabledBorderColor = Color.Transparent,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color(0xFFD1D5DB),
                    disabledTextColor = Color(0xFFD1D5DB),
                    focusedContainerColor = if (isEditing) Color(0xFF374151) else Color(0xFF1F2937),
                    unfocusedContainerColor = if (isEditing) Color(0xFF374151) else Color(0xFF1F2937),
                    disabledContainerColor = Color(0xFF1F2937)
                ),
                singleLine = true
            )
        }
    }
}