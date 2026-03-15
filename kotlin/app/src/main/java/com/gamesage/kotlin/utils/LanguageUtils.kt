package com.gamesage.kotlin.utils

import android.content.Context
import android.content.SharedPreferences
import java.util.Locale
import androidx.core.content.edit

// Objeto de utilidad para gestionar el idioma (Locale) de la aplicación.
// Se encarga de guardar la preferencia del usuario y aplicarla al inicio.
object LanguageUtils {
    private const val PREFS_NAME = "settings"
    private const val KEY_LANGUAGE = "language"

    // Cambia el idioma actual de la aplicación y lo guarda en las preferencias(Lo llama el NavGraph al cambiar idioma).
    fun setLocale(context: Context, languageCode: String) {
        val locale = Locale.forLanguageTag(languageCode)
        Locale.setDefault(locale)
        saveLanguage(context, languageCode)
    }

    // Carga el idioma guardado y lo aplica (se usa en el MainActivity).
    fun loadLocale(context: Context) {
        val languageCode = getSavedLanguage(context)
        setLocale(context, languageCode)
    }

    // Recupera el código del idioma guardado en SharedPreferences(Se usa en loadLocale y en onAttach)
    // Por defecto devuelve "es" (Español) si la app se abre por primera vez.
    fun getSavedLanguage(context: Context): String {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LANGUAGE, "es") ?: "es"
    }

    // Aplica la configuración de idioma al contexto de la aplicación(Se usa en el MainActivity)
    // Es necesario llamarlo en el onAttach de la Activity/Application para que los recursos carguen bien.
    fun onAttach(context: Context): Context {
        val lang = getSavedLanguage(context)
        val locale = Locale.forLanguageTag(lang)
        Locale.setDefault(locale)

        val config = context.resources.configuration
        config.setLocale(locale)
        config.setLayoutDirection(locale)

        // Crea un nuevo contexto con la configuración de idioma aplicada
        return context.createConfigurationContext(config)
    }

    // Guarda físicamente el código del idioma en el almacenamiento interno(Se usa en setLocale)
    private fun saveLanguage(context: Context, languageCode: String) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putString(KEY_LANGUAGE, languageCode) }
    }
}
