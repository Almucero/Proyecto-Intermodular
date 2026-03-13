plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
    alias(libs.plugins.serialize)
    // Secretos para Google Maps
    id("com.google.android.libraries.mapsplatform.secrets-gradle-plugin")
}

android {
    namespace = "com.gamesage.kotlin"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.gamesage.kotlin"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }
    //noinspection WrongGradleMethod
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
            freeCompilerArgs.add("-XXLanguage:+PropertyParamAnnotationDefaultTargetMode")
        }
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

secrets {
    defaultPropertiesFileName = "local.properties"
}

dependencies {
    // Google Maps
    implementation(libs.maps.compose)
    implementation(libs.maps.compose.utils)
    implementation(libs.maps.compose.widgets)

    // Compose Foundation & UI
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.foundation.layout)
    implementation(libs.androidx.ui)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.text.google.fonts)
    implementation(libs.androidx.compose.runtime)

    // Material Design 3
    implementation(libs.androidx.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Room
    implementation(libs.androidx.room.ktx)
    implementation(libs.androidx.room.common.jvm)
    ksp(libs.androidx.room.compiler)

    // Retrofit & Networking
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    implementation(libs.logging.interceptor)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)

    // Hilt (Inyección de dependencias)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)

    // Lifecycle & Navigation
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.activity.compose)

    // CameraX & Permissions
    implementation(libs.accompanist.permissions)
    implementation(libs.androidx.camera.compose)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.core)

    // Utilities
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.androidx.work.runtime.ktx)
    coreLibraryDesugaring(libs.desugar.jdk.libs)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.tooling.preview)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

ksp {
    arg("room.schemaLocation", "$projectDir/schemas")
}