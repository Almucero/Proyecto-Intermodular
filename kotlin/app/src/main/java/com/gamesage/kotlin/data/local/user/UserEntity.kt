package com.gamesage.kotlin.data.local.user

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.gamesage.kotlin.data.model.User
import java.time.LocalDateTime

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey
    val id: Int,
    val accountId: String?,
    val email: String,
    val accountAt: String?,
    val nickname: String?,
    val name: String,
    val surname: String?,
    val passwordHash: String,
    val balance: Double?,
    val points: Int,
    val createdAt: String,
    val updatedAt: String,
    val isAdmin: Boolean,
    val addressLine1: String?,
    val addressLine2: String?,
    val city: String?,
    val region: String?,
    val postalCode: String?,
    val country: String?,
    val avatar: String?
)

fun User.toEntity(): UserEntity {
    return UserEntity(
        id = this.id,
        accountId = this.accountId,
        email = this.email,
        accountAt = this.accountAt,
        nickname = this.nickname,
        name = this.name,
        surname = this.surname,
        passwordHash = this.passwordHash,
        balance = this.balance,
        points = this.points,
        createdAt = this.createdAt.toString(),
        updatedAt = this.updatedAt.toString(),
        isAdmin = this.isAdmin,
        addressLine1 = this.addressLine1,
        addressLine2 = this.addressLine2,
        city = this.city,
        region = this.region,
        postalCode = this.postalCode,
        country = this.country,
        avatar = this.avatar
    )
}

fun List<User>.toEntity(): List<UserEntity> = this.map(User::toEntity)

fun UserEntity.toModel(): User {
    return User(
        id = this.id,
        accountId = this.accountId,
        email = this.email,
        accountAt = this.accountAt,
        nickname = this.nickname,
        name = this.name,
        surname = this.surname,
        passwordHash = this.passwordHash,
        balance = this.balance,
        points = this.points,
        createdAt = LocalDateTime.parse(this.createdAt),
        updatedAt = LocalDateTime.parse(this.updatedAt),
        isAdmin = this.isAdmin,
        addressLine1 = this.addressLine1,
        addressLine2 = this.addressLine2,
        city = this.city,
        region = this.region,
        postalCode = this.postalCode,
        country = this.country,
        avatar = this.avatar,
        media = null
    )
}

fun List<UserEntity>.toModel(): List<User> = this.map(UserEntity::toModel)