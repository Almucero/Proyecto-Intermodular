package com.gamesage.kotlin.ui.common

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.gamesage.kotlin.R

object PresentationUtils {
    fun getGenreNameResId(genreName: String): Int {
        return when (genreName.trim().lowercase()) {
            "action" -> R.string.genre_action
            "acción" -> R.string.genre_action
            "accion" -> R.string.genre_action
            "adventure" -> R.string.genre_adventure
            "aventura" -> R.string.genre_adventure
            "rpg" -> R.string.genre_rpg
            "sports" -> R.string.genre_sports
            "deportes" -> R.string.genre_sports
            "strategy" -> R.string.genre_strategy
            "estrategia" -> R.string.genre_strategy
            "simulation" -> R.string.genre_simulation
            "simulación" -> R.string.genre_simulation
            "simulacion" -> R.string.genre_simulation
            "horror" -> R.string.genre_horror
            "terror" -> R.string.genre_horror
            "racing" -> R.string.genre_racing
            "carreras" -> R.string.genre_racing
            "sandbox" -> R.string.genre_sandbox
            "shooter" -> R.string.genre_shooter
            else -> 0
        }
    }

    @Composable
    fun getLocalizedGenreName(genreName: String): String {
        val resId = getGenreNameResId(genreName)
        return if (resId != 0) stringResource(resId) else genreName
    }

    @Composable
    fun getLocalizedDescription(title: String, defaultDescription: String?): String {
        val context = androidx.compose.ui.platform.LocalContext.current
        val sanitizedTitle = "game_desc_" + title.lowercase()
            .replace(" ", "_")
            .replace(":", "")
            .replace("-", "_")
            .replace("'", "")
            .replace("[^a-z0-9_]".toRegex(), "")

        val resId = context.resources.getIdentifier(sanitizedTitle, "string", context.packageName)
        return if (resId != 0) stringResource(resId) else defaultDescription ?: stringResource(R.string.product_no_description)
    }
}
