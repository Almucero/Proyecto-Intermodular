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
    implementation("androidx.compose.material:material-icons-extended:1.4.3")


    implementation(libs.androidx.compose.foundation.layout)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.ui)
    implementation(libs.androidx.room.common.jvm)
    implementation(libs.androidx.room.ktx)
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.0.4")
    //Coil
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    //Retrofit
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    //Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)
    // View Model
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    // Navigation
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.serialization.json)
    //Others
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui.text.google.fonts)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}