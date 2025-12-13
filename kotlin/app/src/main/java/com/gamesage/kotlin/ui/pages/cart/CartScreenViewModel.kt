package com.gamesage.kotlin.ui.pages.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.data.repository.cart.CartRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartUiState(
    val isLoading: Boolean = false,
    val cartItems: List<CartItem> = emptyList(),
    val error: String? = null,
    val total: Double = 0.0
)

@HiltViewModel
class CartScreenViewModel @Inject constructor(
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    init {
        loadCart()
    }

    fun loadCart() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val result = cartRepository.getCart()
            if (result.isSuccess) {
                val items = result.getOrNull() ?: emptyList()
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        cartItems = items,
                        total = calculateTotal(items)
                    )
                }
            } else {
                _uiState.update {
                    it.copy(isLoading = false, error = "Failed to load cart")
                }
            }
        }
    }

    private fun calculateTotal(items: List<CartItem>): Double {
        return items.sumOf { item ->
            val game = item.game
            val price = if (game?.isOnSale == true && game.salePrice != null) {
                game.salePrice
            } else {
                game?.price ?: 0.0
            }
            price * item.quantity
        }
    }

    fun incrementQuantity(item: CartItem) {
        viewModelScope.launch {
            val newQuantity = item.quantity + 1
            updateItemQuantity(item, newQuantity)
        }
    }

    fun decrementQuantity(item: CartItem) {
        viewModelScope.launch {
            if (item.quantity > 1) {
                updateItemQuantity(item, item.quantity - 1)
            } else {
                removeFromCart(item.gameId, item.platformId)
            }
        }
    }

    private suspend fun updateItemQuantity(item: CartItem, newQuantity: Int) {
        // Optimistic update
        _uiState.update { state ->
            val updatedItems = state.cartItems.map {
                if (it.gameId == item.gameId && it.platformId == item.platformId) it.copy(quantity = newQuantity) else it
            }
            state.copy(cartItems = updatedItems, total = calculateTotal(updatedItems))
        }

        val result = cartRepository.updateCartItem(item.gameId, item.platformId, newQuantity)
        if (result.isFailure) {
            // Revert on failure
            loadCart() 
        }
    }

    fun removeFromCart(gameId: Int, platformId: Int) {
        viewModelScope.launch {
             // Optimistic update
            _uiState.update { state ->
                val updatedItems = state.cartItems.filter { !(it.gameId == gameId && it.platformId == platformId) }
                state.copy(cartItems = updatedItems, total = calculateTotal(updatedItems))
            }
            
            val result = cartRepository.removeFromCart(gameId, platformId)
            if (result.isFailure) {
                loadCart()
            }
        }
    }

    fun checkout() {
        // TODO: Implement checkout logic
    }
}