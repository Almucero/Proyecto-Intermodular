package com.gamesage.kotlin.ui.pages.dashboard

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Build.VERSION.SDK_INT
import android.os.Environment.DIRECTORY_PICTURES
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore.Files.FileColumns.MIME_TYPE
import android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI
import android.provider.MediaStore.MediaColumns.DISPLAY_NAME
import android.provider.MediaStore.MediaColumns.RELATIVE_PATH
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


    //motor de arranque de la camara
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
        // Crea un archivo vacío temporal en la caché donde se guardará la foto antes de procesarla
        val photoFile = File(
            context.cacheDir,
            "photo_${System.currentTimeMillis()}.jpg"
        )
        // Define dónde se va a guardar el archivo de la foto (en el archivo temporal creado arriba)
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        // Ordena a CameraX que dispare la foto. El resultado llega de forma asíncrona a través del callback
        imageCapture.takePicture(
            outputOptions,  // Destino de la foto
            cameraExecutor, // Hilo en segundo plano para no bloquear la UI
            object : ImageCapture.OnImageSavedCallback {

                // Se ejecuta cuando la foto se ha guardado correctamente en el archivo temporal
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    // Prepara los metadatos de la foto para guardarla también en la galería del móvil
                    val contentValues = ContentValues().apply {
                        // Nombre del archivo que aparecerá en la galería
                        put(DISPLAY_NAME, "GameSage_${System.currentTimeMillis()}.jpg")
                        // Tipo de archivo (es una imagen JPEG)
                        put(MIME_TYPE, "image/jpeg")
                        // En Android 10 (API 29) y superior, especificamos la carpeta destino dentro de "Imágenes"
                        if (SDK_INT > Build.VERSION_CODES.P) {
                            put(RELATIVE_PATH, DIRECTORY_PICTURES + "/GameSage")
                        }
                    }
                    // Crea el "hueco" (entrada) en la galería con esos metadatos y obtiene su URI (dirección)
                    val uri = context.contentResolver.insert(EXTERNAL_CONTENT_URI, contentValues)
                    uri?.let {
                        // Abre el destino en la galería para escribir y copia los bytes desde el archivo temporal
                        context.contentResolver.openOutputStream(it)?.use { outputStream ->
                            photoFile.inputStream().use { inputStream ->
                                inputStream.copyTo(outputStream)
                            }
                        }
                    }
                    // Volvemos al hilo principal (UI Thread) para notificar a la pantalla que la foto está lista
                    Handler(Looper.getMainLooper()).post {
                        // Llamamos al callback con el archivo, lo que dispara la navegación a la siguiente pantalla
                        onPhotoCaptured(photoFile)
                    }
                }

                // Se ejecuta si algo sale mal durante la captura de la foto
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