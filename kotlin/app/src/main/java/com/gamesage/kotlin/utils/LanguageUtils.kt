package com.gamesage.kotlin.utils

import android.content.Context
import android.content.SharedPreferences
import java.util.Locale
import androidx.core.content.edit

object LanguageUtils {

    private const val PREFS_NAME = "settings"
    private const val KEY_LANGUAGE = "language"

    fun setLocale(context: Context, languageCode: String) {
        val locale = Locale.forLanguageTag(languageCode)
        Locale.setDefault(locale)
        saveLanguage(context, languageCode)
    }

    fun loadLocale(context: Context) {
        val languageCode = getSavedLanguage(context)
        setLocale(context, languageCode)
    }

    fun getSavedLanguage(context: Context): String {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LANGUAGE, "es") ?: "es"
    }

    fun onAttach(context: Context): Context {
        val lang = getSavedLanguage(context)
        val locale = Locale.forLanguageTag(lang)
        Locale.setDefault(locale)

        val config = context.resources.configuration
        config.setLocale(locale)
        config.setLayoutDirection(locale)

        return context.createConfigurationContext(config)
    }

    private fun saveLanguage(context: Context, languageCode: String) {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit { putString(KEY_LANGUAGE, languageCode) }
    }
}