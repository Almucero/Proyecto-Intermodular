package com.gamesage.kotlin.data.remote

// Importaciones necesarias para el funcionamiento del interceptor
import com.gamesage.kotlin.data.local.TokenManager
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

// Interceptor de OkHttp que se encarga de añadir el token de autenticación a las peticiones de red
class AuthInterceptor @Inject constructor(
    // Inyecta el administrador de tokens para poder recuperar el token de la sesión actual
    private val tokenManager: TokenManager
) : Interceptor {
    // Función principal que intercepta cada petición HTTP antes de salir de la app
    override fun intercept(chain: Interceptor.Chain): Response {
        // Bloquea el hilo actual temporalmente (runBlocking) para leer el token de manera síncrona
        val token = runBlocking {
            // Extrae el primer valor disponible del flujo del TokenManager (puede ser nulo si no hay sesión)
            tokenManager.token.firstOrNull()
        }
        // Coge la petición original entrante y crea un "constructor" (Builder) para poder editarla/modificarla
        val request = chain.request().newBuilder()
        
        // Comprueba si el usuario tiene un token guardado en el dispositivo
        if (token != null) {
            // Si existe el token, le añade a la petición una nueva cabecera llamada "Authorization" con el valor "Bearer [token]"
            request.addHeader("Authorization", "Bearer $token")
        }
        // Continúa la cadena de ejecución construyendo la nueva petición (con o sin cabecera) y enviándola al servidor
        return chain.proceed(request.build())
    }
}
