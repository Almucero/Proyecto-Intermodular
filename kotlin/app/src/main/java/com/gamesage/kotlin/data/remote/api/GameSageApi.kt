package com.gamesage.kotlin.data.remote.api

import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface GameSageApi:
    AuthApi,
    UsersApi,
    GamesApi,
    DevelopersApi,
    PublishersApi,
    GenresApi,
    PlatformsApi,
    MediaApi
interface AuthApi {
    @POST("/api/auth/register")
    suspend fun register()
    @POST("api/auth/login")
    suspend fun login()
}
interface UsersApi {
    @GET("api/users")
    suspend fun readAllUsers()
    @GET("api/users/me")
    suspend fun me()
    @PATCH("api/users/me")
    suspend fun updateOwnUser()
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
    suspend fun readAllGames()
    @POST("api/games")
    suspend fun createGame()
    @GET("api/games/{id}")
    suspend fun readOneGame(@Path("id") id: Int)
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
    suspend fun readAllGenres()
    @POST("api/genres")
    suspend fun createGenre()
    @GET("api/genres/{id}")
    suspend fun readOneGenre(@Path("id") id: Int)
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