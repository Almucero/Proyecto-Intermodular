package com.gamesage.kotlin.data.repository.cart

import com.gamesage.kotlin.data.CartDataSource
import com.gamesage.kotlin.data.local.cart.CartLocalDataSource
import com.gamesage.kotlin.data.model.CartItem
import com.gamesage.kotlin.di.LocalDataSource
import com.gamesage.kotlin.di.RemoteDataSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import javax.inject.Inject

class CartRepositoryImpl @Inject constructor(
    @RemoteDataSource private val remoteDataSource: CartDataSource,
    @LocalDataSource private val localDataSource: CartDataSource,
    //para lanzar corrutinas
    private val scope: CoroutineScope
): CartRepository {
    override suspend fun readAll(): Result<List<CartItem>> {
        val remoteResult = remoteDataSource.readAll()
        return if (remoteResult.isSuccess) {
            // Si hay internet: actualizamos la BBDD y devolvemos los datos frescos
            val items = remoteResult.getOrNull() ?: emptyList()
            // Limpia los datos locales antiguos para sincronizar
            localDataSource.clear()
            (localDataSource as CartLocalDataSource).addAll(items)
            remoteResult
        } else {
            // Si no hay internet se busca lo que haya en la BBDD local
            localDataSource.readAll()
        }
    }

    //Llama al servidor y devuelve el resultado
    override suspend fun readOne(gameId: Int, platformId: Int): Result<CartItem> {
        val remoteResult = remoteDataSource.readOne(gameId, platformId)
        return if (remoteResult.isSuccess) {
            remoteResult
        } else {
            localDataSource.readOne(gameId, platformId)
        }
    }

    //La UI observa la base local
    //El repositorio sincroniza con el servidor
    //Si llegan datos nuevos, se guardan localmente
    //El Flow emite automáticamente
    override fun observe(): Flow<Result<List<CartItem>>> {
        scope.launch {
            readAll()
        }
        return localDataSource.observe()
    }

    //Llama al servidor para añadir producto
    //Si funciona, vuelve a llamar a readAll()
    //Devuelve el resultado
    override suspend fun add(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        val result = remoteDataSource.add(gameId, platformId, quantity)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    override suspend fun update(gameId: Int, platformId: Int, quantity: Int): Result<Unit> {
        //Llama al servidor primero
        val result = remoteDataSource.update(gameId, platformId, quantity)
        //Si el servidor responde bien, refresca la caché local
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    //Borra en servidor
    override suspend fun remove(gameId: Int, platformId: Int): Result<Unit> {
        val result = remoteDataSource.remove(gameId, platformId)
        if (result.isSuccess) {
            readAll()
        }
        return result
    }

    //Llama al servidor para vaciar carrito
    //Si sale bien, limpia base local
    //Devuelve resultado
    override suspend fun clear(): Result<Unit> {
        val result = remoteDataSource.clear()
        if (result.isSuccess) {
            localDataSource.clear()
        }
        return result
    }
}
