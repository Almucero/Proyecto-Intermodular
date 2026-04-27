---
description: Genera un resumen de cambios y propuesta de commit para flujo de rama unica main
---

# Resumen para merge en main (sin PR)

1. Analizar cambios recientes:
```bash
git status --short
git diff --stat
git log -8 --oneline
```
2. Clasificar cambios en: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
3. Proponer mensaje de commit en espanol:
   - primera letra mayuscula,
   - temas relacionados separados por comas,
   - temas radicalmente distintos separados por ` + `.
4. Redactar resumen de entrega con:
   - contexto y objetivo,
   - cambios clave,
   - validaciones realizadas,
   - riesgos o consideraciones.
5. Si el usuario pide PR de forma explicita, adaptar el flujo para `gh pr create`.
