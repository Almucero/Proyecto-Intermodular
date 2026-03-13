package com.gamesage.kotlin.ui.pages.dashboard

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA
import androidx.camera.core.CameraSelector.DEFAULT_FRONT_CAMERA
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.core.SurfaceRequest
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.lifecycle.awaitInstance
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.util.concurrent.Executors

class   CameraViewModel : ViewModel() {
    private val _surfaceRequest = MutableStateFlow<SurfaceRequest?>(null)
    val surfaceRequest = _surfaceRequest.asStateFlow()

    private var cameraSelector = DEFAULT_BACK_CAMERA
    private var cameraProvider: ProcessCameraProvider? = null

    //caso de uso para mostrar la camara en pantalla
    private val previewUseCase = Preview.Builder().build().apply {
        setSurfaceProvider { request ->
            _surfaceRequest.value = request
        }
    }

    private val imageCapture = ImageCapture.Builder()
        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
        .build()

    //para no bloquear la pantalla ya que tomar fotos puede tardar un poco
    private val cameraExecutor = Executors.newSingleThreadExecutor()


    suspend fun bindToCamera(
        context: Context,
        lifecycleOwner: LifecycleOwner
    ) {
        cameraProvider = ProcessCameraProvider.awaitInstance(context)
        bind(lifecycleOwner)
        awaitCancellation()
    }

    fun switchCamera(lifecycleOwner: LifecycleOwner) {
        cameraSelector =
            if (cameraSelector == DEFAULT_BACK_CAMERA)
                DEFAULT_FRONT_CAMERA
            else
                DEFAULT_BACK_CAMERA

        bind(lifecycleOwner)
    }

    fun takePhoto(
        context: Context,
        onPhotoCaptured: (File) -> Unit
    ) {
        val photoFile = File(
            context.cacheDir,
            "photo_${System.currentTimeMillis()}.jpg"
        )
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        imageCapture.takePicture(
            outputOptions,
            cameraExecutor,
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    // COPIA LA IMAGEN A LA GALERÍA
                    val contentValues = android.content.ContentValues().apply {
                        put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, "GameSage_${System.currentTimeMillis()}.jpg")
                        put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                        if (android.os.Build.VERSION.SDK_INT > android.os.Build.VERSION_CODES.P) {
                            put(android.provider.MediaStore.Images.Media.RELATIVE_PATH, android.os.Environment.DIRECTORY_PICTURES + "/GameSage")
                        }
                    }
                    val uri = context.contentResolver.insert(android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
                    uri?.let {
                        context.contentResolver.openOutputStream(it)?.use { outputStream ->
                            photoFile.inputStream().use { inputStream ->
                                inputStream.copyTo(outputStream)
                            }
                        }
                    }
                    Handler(Looper.getMainLooper()).post {
                        onPhotoCaptured(photoFile)
                    }
                }

                override fun onError(exception: ImageCaptureException) {
                    exception.printStackTrace()
                }
            }
        )
    }


    //conecta la cámara a la pantalla
    private fun bind(lifecycleOwner: LifecycleOwner) {
        cameraProvider?.apply {
            unbindAll()
            bindToLifecycle(
                lifecycleOwner,
                cameraSelector,
                previewUseCase,
                imageCapture
            )
        }
    }

}