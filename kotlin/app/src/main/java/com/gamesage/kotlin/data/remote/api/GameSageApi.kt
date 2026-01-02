package com.gamesage.kotlin.data.remote.api

import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import com.gamesage.kotlin.data.remote.model.AuthResponse
import com.gamesage.kotlin.data.remote.model.SignInRequest
import com.gamesage.kotlin.data.remote.model.SignUpRequest
import com.gamesage.kotlin.data.remote.model.CartItemApiModel
import com.gamesage.kotlin.data.remote.model.ChatResponseApiModel
import com.gamesage.kotlin.data.remote.model.ChatSessionApiModel
import com.gamesage.kotlin.data.remote.model.SendMessageRequest
import retrofit2.http.Body

interface GameSageApi:
    AuthApi,
    UsersApi,
    GamesApi,
    DevelopersApi,
    PublishersApi,
    GenresApi,
    PlatformsApi,
    MediaApi,
    CartApi,
    FavoritesApi,
    ChatApi

interface AuthApi {
    @POST("api/auth/register")
    suspend fun register(@Body request: SignUpRequest): AuthResponse
    @POST("api/auth/login")
    suspend fun login(@Body request: SignInRequest): AuthResponse
}
interface UsersApi {
    @GET("api/users")
    suspend fun readAllUsers()
    @GET("api/users/me")
    suspend fun me(): com.gamesage.kotlin.data.remote.model.UserApiModel
    @PATCH("api/users/me")
    suspend fun updateOwnUser(@Body user: com.gamesage.kotlin.data.remote.model.UserApiModel): com.gamesage.kotlin.data.remote.model.AuthResponse
    @PATCH("api/users/me/password")
    suspend fun updateOwnPassword()
    @GET("api/users/{id}")
    suspend fun readOneUser(@Path("id") id: Int)
    @PATCH("api/users/{id}")
    suspend fun updateUser(@Path("id") id: Int)
    @DELETE("api/users/{id}")
    suspend fun deleteUser(@Path("id") id: Int)
}
interface GamesApi {
    @GET("api/games")
    suspend fun readAllGames(@Query("include") include: String = "media,genres,platforms"): List<com.gamesage.kotlin.data.remote.model.GameApiModel>
    @POST("api/games")
    suspend fun createGame()
    @GET("api/games/{id}")
    suspend fun readOneGame(@Path("id") id: Int): com.gamesage.kotlin.data.remote.model.GameApiModel
    @PATCH("api/games/{id}")
    suspend fun updateGame(@Path("id") id: Int)
    @DELETE("api/games/{id}")
    suspend fun deleteGame(@Path("id") id: Int)
}
interface DevelopersApi {
    @GET("api/developers")
    suspend fun readAllDevelopers()
    @POST("api/developers")
    suspend fun createDeveloper()
    @GET("api/developers/{id}")
    suspend fun readOneDeveloper(@Path("id") id: Int)
    @PATCH("api/developers/{id}")
    suspend fun updateDeveloper(@Path("id") id: Int)
    @DELETE("api/developers/{id}")
    suspend fun deleteDeveloper(@Path("id") id: Int)
}
interface PublishersApi {
    @GET("api/publishers")
    suspend fun readAllPublishers()
    @POST("api/publishers")
    suspend fun createPublisher()
    @GET("api/publishers/{id}")
    suspend fun readOnePublisher(@Path("id") id: Int)
    @PATCH("api/publishers/{id}")
    suspend fun updatePublisher(@Path("id") id: Int)
    @DELETE("api/publishers/{id}")
    suspend fun deletePublisher(@Path("id") id: Int)
}
interface GenresApi {
    @GET("api/genres")
    suspend fun readAllGenres(): List<com.gamesage.kotlin.data.remote.model.GenreApiModel>
    @POST("api/genres")
    suspend fun createGenre()
    @GET("api/genres/{id}")
    suspend fun readOneGenre(@Path("id") id: Int): com.gamesage.kotlin.data.remote.model.GenreApiModel
    @PATCH("api/genres/{id}")
    suspend fun updateGenre(@Path("id") id: Int)
    @DELETE("api/genres/{id}")
    suspend fun deleteGenre(@Path("id") id: Int)
}
interface PlatformsApi {
    @GET("api/platforms")
    suspend fun readAllPlatforms()
    @POST("api/platforms")
    suspend fun createPlatform()
    @GET("api/platforms/{id}")
    suspend fun readOnePlatform(@Path("id") id: Int)
    @PATCH("api/platforms/{id}")
    suspend fun updatePlatform(@Path("id") id: Int)
    @DELETE("api/platforms/{id}")
    suspend fun deletePlatform(@Path("id") id: Int)
}
interface MediaApi {
    @GET("api/media")
    suspend fun readAllMedia()
    @POST("api/media/upload")
    suspend fun createMedia()
    @GET("api/media/{id}")
    suspend fun readOneMedia(@Path("id") id: Int)
    @DELETE("api/media/{id}")
    suspend fun deleteMedia(@Path("id") id: Int)
    @PATCH("api/media/{id}/upload")
    suspend fun updateMedia(@Path("id") id: Int)
}

interface CartApi {
    @GET("api/cart")
    suspend fun getCart(): List<com.gamesage.kotlin.data.remote.model.CartItemApiModel>
    
    @POST("api/cart")
    suspend fun addToCart(@Body body: Map<String, Int>)
    
    @PATCH("api/cart/{gameId}")
    suspend fun updateCartItem(@Path("gameId") gameId: Int, @Body body: Map<String, Int>)
    
    @DELETE("api/cart/{gameId}")
    suspend fun removeFromCart(@Path("gameId") gameId: Int, @Query("platformId") platformId: Int)

    @DELETE("api/cart")
    suspend fun clearCart()
}

interface FavoritesApi {
    @GET("api/favorites")
    suspend fun getFavorites(): List<com.gamesage.kotlin.data.remote.model.FavoriteApiModel>

    @POST("api/favorites")
    suspend fun addToFavorites(@Body body: Map<String, Int>)

    @DELETE("api/favorites/{gameId}")
    suspend fun removeFromFavorites(@Path("gameId") gameId: Int, @Query("platformId") platformId: Int = 0)

    @GET("api/favorites/check/{gameId}")
    suspend fun isFavorite(@Path("gameId") gameId: Int, @Query("platformId") platformId: Int = 0): Boolean
}

interface ChatApi {
    @GET("/api/chat/sessions")
    suspend fun getSessions(): List<ChatSessionApiModel>

    @GET("/api/chat/sessions/{id}")
    suspend fun getSession(@Path("id") id: Int): ChatSessionApiModel

    @POST("/api/chat")
    suspend fun sendMessage(@Body request: SendMessageRequest): ChatResponseApiModel

    @DELETE("/api/chat/sessions/{id}")
    suspend fun deleteSession(@Path("id") id: Int)
}