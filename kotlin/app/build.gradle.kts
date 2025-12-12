plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
    alias(libs.plugins.serialize)
}

android {
    namespace = "com.gamesage.kotlin"
    compileSdk {
        version = release(36)
    }

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
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
        isCoreLibraryDesugaringEnabled = true
    }
    kotlinOptions {
        jvmTarget = "1.8"
        freeCompilerArgs = listOf("-XXLanguage:+PropertyParamAnnotationDefaultTargetMode")
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")

    // --- TESTING ---
    testImplementation("junit:junit:4.13.2")
    // --- LIBRERÍAS PRINCIPALES DE ANDROIDX ---
    // Usando versiones estables y probadas
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.3")
    implementation("androidx.activity:activity-compose:1.9.0")

    // --- COMPOSE (BOM para alinear versiones) ---
    // Se declara UNA SOLA VEZ para gobernar las versiones de Compose.
    // Usando una BOM estable y reciente.
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))

    // Dependencias de Compose SIN especificar versión. La BOM se encarga.
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation-layout")
    implementation("androidx.compose.ui:ui-text-google-fonts")

    // --- NAVEGACIÓN Y VIEWMODEL ---
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.3")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // --- HILT (Inyección de Dependencias) ---
    // Usando una versión de Hilt muy estable y ampliamente compatible.
    implementation("com.google.dagger:hilt-android:2.51.1")
    ksp("com.google.dagger:hilt-compiler:2.51.1")

    // --- ROOM (Base de Datos) ---
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // --- COIL (Carga de Imágenes) ---
    // Usando la versión 2, que es la estable y recomendada.
    implementation("io.coil-kt:coil-compose:2.6.0")

    // --- RETROFIT (Red) ---
    // Usando la versión 2.x, la más estable y usada.
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")

    // --- SERIALIZACIÓN (si la usas con Retrofit en lugar de Gson) ---
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    // --- TESTING ---
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.06.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
