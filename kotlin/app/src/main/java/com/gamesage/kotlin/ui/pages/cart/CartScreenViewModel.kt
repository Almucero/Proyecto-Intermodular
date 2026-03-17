package com.gamesage.kotlin.ui.pages.cart

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.R
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.repository.cart.CartRepository
import com.gamesage.kotlin.utils.LanguageUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// Modelo que usa la UI para mostrar cada producto del carrito
// No es el modelo de base de datos, es una versión adaptada para mostrar en pantalla
data class CartItemUiState(
    val gameId: Int,
    val platformId: Int,
    val title: String,
    val imageUrl: String,
    val developerName: String?,
    val quantity: Int,
    val price: Double,
    val salePrice: Double?,
    val isOnSale: Boolean,
    val itemTotal: Double
)

// Estados de pantalla
sealed class CartUiState {
    object Initial : CartUiState()
    object Loading : CartUiState()
    data class Success(val items: List<CartItemUiState>, val total: Double) : CartUiState()
    data class Error(val message: String) : CartUiState()
}

// Se comunica con el CartRepository (que accede a la base de datos)
@HiltViewModel
class CartScreenViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val loadingManager: com.gamesage.kotlin.utils.LoadingManager,
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val localizedContext: Context
        get() = LanguageUtils.onAttach(context)
    private val _uiState = MutableStateFlow<CartUiState>(CartUiState.Initial)
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    // Para mostrar mensajes de error temporales (tipo Snackbar)
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Cuando se crea el ViewModel, automáticamente observa el carrito.
    init {
        observeCart()
    }

    private fun observeCart() {
        viewModelScope.launch {
            // El estado se muestra en loading mientras se obtiene la información del carrito
            _uiState.value = CartUiState.Loading
            // Delay mínimo para ver rueda de carga (como en favoritos) y mejor obtención de datos
            kotlinx.coroutines.delay(400)
            // Se observa el flujo de datos desde el repositorio del carrito
            cartRepository.observe().collect { result ->
                if (result.isSuccess) {
                    // Si es exitoso, se obtiene la lista de elementos del carrito o si es nulo una lista vacía
                    val items = result.getOrNull() ?: emptyList()
                    // Se actualiza el estado de la UI con los datos obtenidos, se mapea los datos con el CartItemUiState y se calcula el total
                    _uiState.value = CartUiState.Success(
                        items = items.map { it.asCartItemUiState() },
                        total = calculateTotal(items)
                    )
                } else {
                    // Si falla, se muestra un mensaje de error
                    _uiState.value = CartUiState.Error(
                        localizedContext.getString(R.string.error_cart_load)
                    )
                }
            }
        }
    }

    // Calcula el total general del carrito.
    private fun calculateTotal(items: List<CartItem>): Double {
        // Suma los resultados de una operación sobre una la lista, CartItem
        return items.sumOf { item ->
            // Se extrae el objeto game del item
            val game = item.game
            // Si está en oferta usa salePrice.
            // Si no, usa price normal.
            val price = if (game?.isOnSale == true && game.salePrice != null) {
                game.salePrice
            } else {
                game?.price ?: 0.0
            }
            price * item.quantity
        }
    }

    // Actualiza la cantidad de un producto.
    private suspend fun updateItemQuantity(item: CartItemUiState, newQuantity: Int) {
        loadingManager.setBlocking(true)
        // Hacemos llamada al repositorio para actualizar la cantidad
        val result = cartRepository.update(item.gameId, item.platformId, newQuantity)
        if (result.isFailure) {
            _errorMessage.value =
                localizedContext.getString(R.string.error_cart_update_network)
        }
        loadingManager.setBlocking(false)
    }

    // Aumenta la cantidad en +1
    // Llama a updateItemQuantity
    fun incrementQuantity(item: CartItemUiState) {
        viewModelScope.launch {
            val newQuantity = item.quantity + 1
            updateItemQuantity(item, newQuantity)
        }
    }


    fun decrementQuantity(item: CartItemUiState) {
        viewModelScope.launch {
            // Si cantidad > 1, resta 1
            if (item.quantity > 1) {
                updateItemQuantity(item, item.quantity - 1)
            } else {
                // Si cantidad = 1,elimina el producto
                removeFromCart(item.gameId, item.platformId)
            }
        }
    }

    // Elimina un producto del carrito.
    fun removeFromCart(gameId: Int, platformId: Int) {
        viewModelScope.launch {
            loadingManager.setBlocking(true)
            val result = cartRepository.remove(gameId, platformId)
            if (result.isFailure) {
                _errorMessage.value =
                    localizedContext.getString(R.string.error_cart_remove_network)
            }
            loadingManager.setBlocking(false)
        }
    }

    // Vacía completamente el carrito.
    fun clearCart() {
        viewModelScope.launch {
            loadingManager.setBlocking(true)
            val result = cartRepository.clear()
            if (result.isFailure) {
                _errorMessage.value =
                    localizedContext.getString(R.string.error_cart_clear_network)
            }
            loadingManager.setBlocking(false)
        }
    }

    // Simula el proceso de pago/checkout
    fun checkout() {
        viewModelScope.launch {
            loadingManager.setBlocking(true)
            // En una app real aquí se llamaría a la API de pedidos. 
            // Por ahora, vaciamos el carrito como señal de compra completada.
            val result = cartRepository.clear()
            if (result.isSuccess) {
                _errorMessage.value =
                    localizedContext.getString(R.string.cart_checkout_success)
            } else {
                _errorMessage.value =
                    localizedContext.getString(R.string.cart_checkout_error)
            }
            loadingManager.setBlocking(false)
        }
    }

    // Limpia el mensaje de error después de mostrarlo
    fun clearError() {
        _errorMessage.value = null
    }
}

// Convierte un objeto de tipo CartItem en un objeto CartItemUiState
fun CartItem.asCartItemUiState(): CartItemUiState {
    val game = this.game
    // Calcula precio correcto (oferta o normal)
    val unitPrice = if (game?.isOnSale == true && game.salePrice != null) {
        game.salePrice
    } else {
        game?.price ?: 0.0
    }
    return CartItemUiState(
        gameId = this.gameId,
        platformId = this.platformId,
        title = game?.title ?: "Unknown Game",
        imageUrl = game?.media?.firstOrNull()?.url ?: "https://imgs.search.brave.com/fYkD5wfC_-Rme5c7BsUqQrc85GwiSHKVsArtXOFqpBc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzQzLzk3LzA4/LzM2MF9GXzY0Mzk3/MDg2OV9xWVduenp1/em5iTU83VGF5bVFp/cndNblE1ZmlRSFpi/dS5qcGc",
        developerName = game?.Developer?.name,
        quantity = this.quantity,
        price = game?.price ?: 0.0,
        salePrice = game?.salePrice,
        isOnSale = game?.isOnSale ?: false,
        itemTotal = unitPrice * this.quantity
    )
}