package com.gamesage.kotlin.ui.pages.register

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R

@Composable
fun RegisterScreen(
    viewModel: RegisterScreenViewModel = hiltViewModel(),
    onNavigateToLogin: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val formData by viewModel.formData.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    var passwordVisible by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState) {
        if (uiState is RegisterUiState.Success) {
            onNavigateToLogin()
        }
    }

    LaunchedEffect(errorMessage) {
        errorMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = Color(0xFF111827)
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            when (uiState) {
                is RegisterUiState.Loading -> {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = Color(0xFF22D3EE))
                    }
                }
                else -> {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF374151)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Column(
                            modifier = Modifier
                                .padding(24.dp)
                                .fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = stringResource(R.string.register_title),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )

                            Text(
                                text = stringResource(R.string.register_has_account),
                                color = Color.White,
                                fontSize = 14.sp
                            )
                            TextButton(onClick = onNavigateToLogin) {
                                Text(
                                    text = stringResource(R.string.register_login_here),
                                    color = Color(0xFF93E3FE),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            OutlinedTextField(
                                value = formData.name,
                                onValueChange = viewModel::onNameChange,
                                label = { Text(stringResource(R.string.register_name), color = Color.Gray) },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color.Gray) },
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF93E3FE),
                                    unfocusedBorderColor = Color.Gray,
                                    cursorColor = Color(0xFF93E3FE)
                                ),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = formData.surname,
                                onValueChange = viewModel::onSurnameChange,
                                label = { Text(stringResource(R.string.register_surname), color = Color.Gray) },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color.Gray) },
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF93E3FE),
                                    unfocusedBorderColor = Color.Gray,
                                    cursorColor = Color(0xFF93E3FE)
                                ),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = formData.email,
                                onValueChange = viewModel::onEmailChange,
                                label = { Text(stringResource(R.string.register_email), color = Color.Gray) },
                                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = Color.Gray) },
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF93E3FE),
                                    unfocusedBorderColor = Color.Gray,
                                    cursorColor = Color(0xFF93E3FE)
                                ),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = formData.password,
                                onValueChange = viewModel::onPasswordChange,
                                label = { Text(stringResource(R.string.register_password), color = Color.Gray) },
                                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color.Gray) },
                                trailingIcon = {
                                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = if (passwordVisible) stringResource(R.string.common_hide) else stringResource(R.string.common_show),
                                            tint = Color.Gray
                                        )
                                    }
                                },
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF93E3FE),
                                    unfocusedBorderColor = Color.Gray,
                                    cursorColor = Color(0xFF93E3FE)
                                ),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = formData.confirmPassword,
                                onValueChange = viewModel::onConfirmPasswordChange,
                                label = { Text(stringResource(R.string.register_confirm_password), color = Color.Gray) },
                                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color.Gray) },
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color(0xFF93E3FE),
                                    unfocusedBorderColor = Color.Gray,
                                    cursorColor = Color(0xFF93E3FE)
                                ),
                                singleLine = true
                            )
                            
                            if (uiState is RegisterUiState.Error) {
                                Text(
                                    text = (uiState as RegisterUiState.Error).message,
                                    color = Color.Red,
                                    fontSize = 14.sp,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                            }

                            Button(
                                onClick = { viewModel.register() },
                                modifier = Modifier.fillMaxWidth().height(50.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6)),
                                shape = RoundedCornerShape(25.dp),
                                enabled = true
                            ) {
                                Text(stringResource(R.string.register_button), color = Color.White, fontSize = 16.sp)
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Button(
                                onClick = onNavigateBack,
                                modifier = Modifier.fillMaxWidth().height(50.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
                                shape = RoundedCornerShape(25.dp)
                            ) {
                                Text(stringResource(R.string.register_back), color = Color.White, fontSize = 16.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

