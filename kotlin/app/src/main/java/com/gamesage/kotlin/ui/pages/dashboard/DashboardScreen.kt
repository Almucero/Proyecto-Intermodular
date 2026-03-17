package com.gamesage.kotlin.ui.pages.dashboard

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapFactory.decodeByteArray
import android.graphics.Matrix
import android.util.Base64
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign.Companion.Center
import androidx.compose.ui.text.withLink
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.exifinterface.media.ExifInterface
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import coil3.compose.AsyncImage
import coil3.compose.rememberAsyncImagePainter
import com.gamesage.kotlin.R
import com.gamesage.kotlin.ui.theme.bodyFontFamily
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream

// Pantalla principal del perfil de usuario.
// Permite observar, editar el perfil, cambiar fotos y cerrar sesión.
@SuppressLint("FrequentlyChangingValue")
@Composable
fun DashboardScreen(
    onPrivacyClick: () -> Unit,
    viewModel: DashboardScreenViewModel = hiltViewModel(),
    onLogout: () -> Unit,
    onNavigateToCamera: () -> Unit,
    capturedPhoto: String? = null,
    onPhotoProcessed: () -> Unit = {},
) {
    // Observa el estado y mensajes de error desde el ViewModel.
    val uiState by viewModel.uiState.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val context = LocalContext.current
    val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
    var showCameraOptions by remember { mutableStateOf(false) }
    val sessionKey = remember { System.currentTimeMillis() }

    // Para mostrar el Snackbar
    val snackbarHostState = remember { SnackbarHostState() }

    // Escucha cambios en el mensaje de error y dispara el snackbar
    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    // Navega fuera cuando la sesión se ha cerrado con éxito
    LaunchedEffect(uiState) {
        if (uiState is DashboardUiState.Initial) {
            onLogout()
        }
    }

    // Recibe la foto capturada desde la cámara y la procesa para el perfil.
    LaunchedEffect(capturedPhoto) {
        capturedPhoto?.let { path ->
            if (path.isNotEmpty()) {
                val originalFile = File(path)
                val (processedFile, avatarBase64) = processAndRotateImage(context, originalFile)
                val currentEditable = (uiState as? DashboardUiState.Success)?.editableUser ?: UserEditableData()
                viewModel.onEditableDataChange(
                    currentEditable.copy(
                        avatar = avatarBase64,
                        selectedFile = processedFile
                    )
                )
                onPhotoProcessed()
            }
        }
    }

    // Logica para elegir una imagen de la galería.
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
                    // Crea un archivo temporal para procesarlo
                    val tempFile = File(context.cacheDir, "picked_image_${System.currentTimeMillis()}.jpg")
                    tempFile.writeBytes(bytes)

                    // Se usa la nueva función de procesado
                    val (processedFile, avatarString) = processAndRotateImage(context, tempFile)

                    val currentEditable = (uiState as? DashboardUiState.Success)?.editableUser ?: UserEditableData()
                    viewModel.onEditableDataChange(
                        currentEditable.copy(
                            avatar = avatarString,
                            selectedFile = processedFile
                        )
                    )
                }
            } catch (_: Exception) {
                Toast.makeText(context, imageErrorMessage, Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = Color(0xFF111827)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF111827))
        ) {
            // Manejo de estados de la UI (Cargando, Error o Éxito).
            when (val state = uiState) {
                is DashboardUiState.Initial, DashboardUiState.Loading -> {
                    //Estado inicial y carga de datos.
                    Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                    }
                }

                is DashboardUiState.Error -> {
                    // Muestra el mensaje de error si algo falla.
                    Box(modifier = Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                        Text(text = state.message, color = Color.Red, textAlign = Center)
                    }
                }

                is DashboardUiState.Success -> {
                    Box(modifier = Modifier.fillMaxSize()) {
                        val scrollState = rememberScrollState()
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(scrollState)
                                .padding(
                                    start = 16.dp,
                                    end = 16.dp,
                                    top = paddingValues.calculateTopPadding() + 16.dp,
                                    bottom = 32.dp
                                ),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Título de la sección.
                            Text(
                                text = stringResource(R.string.dashboard_user_section),
                                fontSize = 30.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF93E3FE),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                textAlign = Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            // Contenedor para la Imagen de perfil.
                            Box(
                                modifier = Modifier.size(192.dp)
                            ) {
                                val avatarData = if (state.isEditing) {
                                    state.editableUser.avatar
                                } else {
                                    state.user.avatar
                                }

                                if (!avatarData.isNullOrEmpty() && (avatarData.startsWith("data:image") || avatarData.length > 200)) {
                                    val base64String = if (avatarData.contains("base64,")) {
                                        avatarData.substringAfter("base64,")
                                    } else {
                                        avatarData
                                    }.trim()
                                    val bytes = Base64.decode(base64String, Base64.DEFAULT)
                                    val bitmap = decodeByteArray(bytes, 0, bytes.size)
                                    if (bitmap != null) {
                                        Image(
                                            bitmap = bitmap.asImageBitmap(),
                                            contentDescription = stringResource(R.string.dashboard_cd_user),
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .clip(CircleShape)
                                                .background(Color.Gray)
                                                .border(width = 2.dp, color = Color.White, shape = CircleShape),
                                            contentScale = ContentScale.Crop
                                        )
                                    }
                                } else if (!avatarData.isNullOrEmpty()) {
                                    val avatarUrl = if (avatarData.startsWith("http")) "$avatarData?t=$sessionKey" else avatarData
                                    AsyncImage(
                                        model = avatarUrl,
                                        contentDescription = stringResource(R.string.dashboard_cd_user),
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(CircleShape)
                                            .background(Color.Gray)
                                            .border(width = 2.dp, color = Color.White, shape = CircleShape),
                                        contentScale = ContentScale.Crop,
                                        error = rememberAsyncImagePainter("https://imgs.search.brave.com/fYkD5wfC_-Rme5c7BsUqQrc85GwiSHKVsArtXOFqpBc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzQzLzk3LzA4/LzM2MF9GXzY0Mzk3/MDg2OV9xWVduenp1/em5iTU83VGF5bVFp/cndNblE1ZmlRSFpi/dS5qcGc")
                                    )
                                } else {
                                    // Círculo gris por defecto si no hay foto (en caso de sí haber foto, pero no haber conexión se establece una por defecto más abajo)
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(CircleShape)
                                            .background(Color(0xFF374151))
                                            .border(width = 2.dp, color = Color.White, shape = CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.PhotoCamera,
                                            contentDescription = null,
                                            tint = Color(0xFF6B7280),
                                            modifier = Modifier.size(64.dp)
                                        )
                                    }
                                }

                                if (state.isEditing) {
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
                                            contentDescription = stringResource(R.string.dashboard_change_picture),
                                            tint = Color.White,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }
                                }

                                // Muestra el diálogo para elegir el origen de la foto (Cámara o Galería).
                                if (showCameraOptions) {
                                    AlertDialog(
                                        onDismissRequest = { showCameraOptions = false },
                                        containerColor = Color(0xFF1F2937),
                                        title = {
                                            Text(
                                                stringResource(R.string.dashboard_camera_title),
                                                color = Color(0xFFA5F3FC),
                                                fontSize = 30.sp,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = bodyFontFamily,
                                                textAlign = Center,
                                                modifier = Modifier.fillMaxWidth()
                                            )
                                        },
                                        text = {
                                            Column(
                                                modifier = Modifier.fillMaxWidth()
                                                    .padding(top = 16.dp),
                                                horizontalAlignment = Alignment.CenterHorizontally
                                            ) {
                                                Button(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    onClick = {
                                                        showCameraOptions = false
                                                        onNavigateToCamera()
                                                    },
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = Color(0xFF22D3EE)
                                                    ),
                                                    shape = RoundedCornerShape(8.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Filled.PhotoCamera,
                                                        contentDescription = null,
                                                        modifier = Modifier.size(20.dp)
                                                    )
                                                    Spacer(modifier = Modifier.width(8.dp))
                                                    Text(stringResource(R.string.dashboard_camera_take_photo), color = Color.White)
                                                }

                                                Spacer(modifier = Modifier.height(12.dp))

                                                Button(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    onClick = {
                                                        showCameraOptions = false
                                                        launcher.launch(
                                                            PickVisualMediaRequest(
                                                                ActivityResultContracts.PickVisualMedia.ImageOnly
                                                            )
                                                        )
                                                    },
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = Color(0xFF374151)
                                                    ),
                                                    shape = RoundedCornerShape(8.dp),
                                                    border = BorderStroke(1.dp, Color(0xFF4B5563))
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Filled.PhotoLibrary,
                                                        contentDescription = null,
                                                        modifier = Modifier.size(20.dp),
                                                        tint = Color(0xFF22D3EE)
                                                    )
                                                    Spacer(modifier = Modifier.width(8.dp))
                                                    Text(stringResource(R.string.dashboard_camera_pick_gallery), color = Color.White)
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
                                text = state.user.nickname
                                    ?: stringResource(R.string.dashboard_user_placeholder),
                                fontSize = 30.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Row(
                                modifier = Modifier.padding(top = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "@${state.user.nickname ?: ""}",
                                    color = Color(0xFF9CA3AF)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_copy),
                                    contentDescription = stringResource(R.string.dashboard_copy_nickname_cd),
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clickable {
                                            val clip = android.content.ClipData.newPlainText(
                                                "Nickname",
                                                "@${state.user.nickname}"
                                            )
                                            clipboardManager.setPrimaryClip(clip)
                                            Toast.makeText(context, copiedMessage, Toast.LENGTH_SHORT).show()
                                        },
                                    tint = Color.Gray
                                )
                            }

                            Row(
                                modifier = Modifier.padding(top = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "ID: ${state.user.id}",
                                    color = Color(0xFF6B7280),
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_copy),
                                    contentDescription = stringResource(R.string.dashboard_copy_id_cd),
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clickable {
                                            val clip = android.content.ClipData.newPlainText(
                                                "User ID",
                                                state.user.id.toString()
                                            )
                                            clipboardManager.setPrimaryClip(clip)
                                            Toast.makeText(context, copiedMessage, Toast.LENGTH_SHORT).show()
                                        },
                                    tint = Color.Gray
                                )
                            }

                            Spacer(modifier = Modifier.height(32.dp))
                            // Encabezado: Información de la cuenta
                            SectionHeader(stringResource(R.string.dashboard_account_info))
                            // Campo para el nombre de usuario
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_username),
                                value = state.editableUser.nickname,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            nickname = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            // Campo para ver/editar el email de la cuenta.
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_email),
                                value = state.editableUser.email,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            email = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )

                            Spacer(modifier = Modifier.height(32.dp))
                            // Encabezado: Datos Personales
                            SectionHeader(stringResource(R.string.dashboard_personal_data))

                            val privacyText = stringResource(R.string.dashboard_privacy_text)
                            val privacyLink = stringResource(R.string.dashboard_privacy_link)
                            val annotatedPrivacyString = buildAnnotatedString {
                                append(privacyText)
                                val link = LinkAnnotation.Clickable(
                                    tag = "PRIVACY",
                                    linkInteractionListener = {
                                        onPrivacyClick()
                                    }
                                )
                                withLink(link) {
                                    withStyle(
                                        style = SpanStyle(
                                            color = Color(0xFF22D3EE),
                                            fontWeight = FontWeight.Bold
                                        )
                                    ) {
                                        append(privacyLink)
                                    }
                                }
                            }

                            Text(
                                text = annotatedPrivacyString,
                                style = TextStyle(
                                    color = Color(0xFF6B7280),
                                    fontSize = 14.sp
                                ),
                                modifier = Modifier.padding(bottom = 16.dp)
                            )

                            // Campo para el nombre
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_name),
                                value = state.editableUser.name,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            name = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_surname),
                                value = state.editableUser.surname,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            surname = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )

                            Spacer(modifier = Modifier.height(32.dp))
                            // Encabezado: Dirección
                            SectionHeader(stringResource(R.string.dashboard_address_section))
                            // Campo para la dirección línea 1
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_address_line1),
                                value = state.editableUser.addressLine1,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            addressLine1 = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_address_line2),
                                value = state.editableUser.addressLine2,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            addressLine2 = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_city),
                                value = state.editableUser.city,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            city = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_region),
                                value = state.editableUser.region,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            region = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_postal_code),
                                value = state.editableUser.postalCode,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            postalCode = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            DashboardTextField(
                                label = stringResource(R.string.dashboard_country),
                                value = state.editableUser.country,
                                onValueChange = {
                                    viewModel.onEditableDataChange(
                                        state.editableUser.copy(
                                            country = it
                                        )
                                    )
                                },
                                isEditing = state.isEditing
                            )

                            Spacer(modifier = Modifier.height(32.dp))

                            // Fila de botones principales (Configurar y Cerrar Sesión)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Button(
                                    onClick = { viewModel.toggleEdit() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(
                                            0xFF22D3EE
                                        )
                                    ),
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = if (state.isEditing) stringResource(R.string.dashboard_cancel) else stringResource(
                                            R.string.dashboard_configure
                                        ),
                                        color = Color.White
                                    )
                                }
                                Button(
                                    onClick = { viewModel.logout() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(
                                            0xFFDC2626
                                        )
                                    ),
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        stringResource(R.string.dashboard_logout),
                                        color = Color.White
                                    )
                                }
                            }

                            // Botón de guardar
                            if (state.isEditing) {
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(
                                    onClick = { viewModel.saveChanges() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(
                                            0xFF16A34A
                                        )
                                    ),
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        stringResource(R.string.dashboard_save),
                                        color = Color.White
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(32.dp))
                        }

                        if (scrollState.value > 0) {
                            Box(modifier = Modifier
                                .fillMaxWidth()
                                .height(paddingValues.calculateTopPadding() + 16.dp)
                                .align(Alignment.TopCenter)
                                .background(
                                    brush = Brush.verticalGradient(
                                        colors = listOf(Color(0xFF111827), Color.Transparent)
                                    )
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}


//Cabecera de sección para los campos del perfil.
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

//Campo de texto personalizado que alterna entre lectura y edición.
@Composable
fun DashboardTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    isEditing: Boolean
) {
    var isFocused by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterStart) {
        OutlinedTextField(
            value = value,
            onValueChange = if (isEditing) onValueChange else { _ -> },
            label = if (value.isNotEmpty()) { { Text(label) } } else null,
            placeholder = { Text(label, color = Color(0xFF9CA3AF)) },
            readOnly = !isEditing,
            modifier = Modifier
                .fillMaxWidth()
                .onFocusChanged { isFocused = it.isFocused },
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

        if (value.isEmpty() && !isFocused) {
            Text(
                text = label,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(start = 16.dp),
                fontSize = 16.sp
            )
        }
    }
}


// Función auxiliar para corregir rotación, comprimir y generar Base64
fun processAndRotateImage(context: Context, file: File): Pair<File, String> {
    val bitmap = BitmapFactory.decodeFile(file.absolutePath)
    val exif = ExifInterface(file.absolutePath)
    val orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
    val matrix = Matrix()
    when (orientation) {
        ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
        ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
        ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
    }
    val rotatedBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)

    // 1. Guardar la imagen ya rotada y comprimida en un nuevo archivo para enviarlo al servidor
    val newFile = File(context.cacheDir, "avatar_ready_${System.currentTimeMillis()}.jpg")
    FileOutputStream(newFile).use { out ->
        rotatedBitmap.compress(Bitmap.CompressFormat.JPEG, 80, out)
    }

    // 2. Generar el Base64 para actualizar la vista previa en la UI
    val outputStream = ByteArrayOutputStream()
    rotatedBitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
    val base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)

    return Pair(newFile, "data:image/jpeg;base64,$base64")
}