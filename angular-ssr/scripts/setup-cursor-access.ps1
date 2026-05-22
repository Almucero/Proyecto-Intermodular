<#
  @file: scripts/setup-cursor-access.ps1
  @project: GameSage - Plataforma de Videojuegos
  @authors: Rosario González y Álvaro Jiménez
  @description: Script PowerShell para configurar variables de entorno MCP y verificar que las dependencias necesarias de uv/mcp estén instaladas para Cursor.
#>

# Configura PowerShell para que se detenga inmediatamente si ocurre cualquier error no controlado
$ErrorActionPreference = "Stop"

# Calcula el directorio raíz del proyecto subiendo un nivel desde la carpeta del script actual
$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env"

# Comprueba la existencia del archivo de configuración local .env
if (-not (Test-Path $envFile)) {
  Write-Error "No se encontró .env en la raíz del proyecto."
}

# Verifica si la herramienta 'uv' (administrador rápido de dependencias de Python) está disponible en el PATH
$uvCommand = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uvCommand) {
  Write-Host "uv no está instalado. Iniciando instalación..."
  # Descarga e instala 'uv' de forma silenciosa y automática a través del script de Astral
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  
  # Recarga las variables de entorno de máquina y usuario en la sesión activa para detectar el nuevo binario
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
  $uvCommand = Get-Command uv -ErrorAction SilentlyContinue
  
  if (-not $uvCommand) {
    Write-Error "No se pudo instalar o detectar uv automáticamente. Reinicia la terminal y prueba de nuevo."
  }
}

# Conjunto de variables clave de entorno que necesitamos sincronizar con Cursor para la automatización MCP
$targetKeys = @(
  "GITHUB_TOKEN",
  "JIRA_URL",
  "JIRA_USERNAME",
  "JIRA_API_TOKEN",
  "POSTGRES_PRISMA_URL"
)

# Diccionarios de control para el reporte final en consola
$loaded = @{}
$skipped = @{}

# Lee y procesa línea por línea el archivo .env
foreach ($line in Get-Content $envFile) {
  $trimmed = $line.Trim()
  # Omite líneas en blanco o comentarios que inician con '#'
  if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#")) {
    continue
  }

  $separatorIndex = $trimmed.IndexOf("=")
  if ($separatorIndex -lt 1) {
    continue
  }

  # Divide la clave y el valor
  $key = $trimmed.Substring(0, $separatorIndex).Trim()
  $value = $trimmed.Substring($separatorIndex + 1).Trim()

  # Si la variable pertenece a las deseadas y no está en blanco
  if ($targetKeys -contains $key -and -not [string]::IsNullOrWhiteSpace($value)) {
    # Filtra si el valor asignado es un marcador de posición de ejemplo (placeholder)
    if (
      $value -match '^your_' -or
      $value -match '^your[A-Z_]' -or
      $value -eq 'your_github_token' -or
      $value -eq 'your_jira_url' -or
      $value -eq 'your_jira_username' -or
      $value -eq 'your_jira_api_token'
    ) {
      $skipped[$key] = "placeholder"
      continue
    }

    $loaded[$key] = $value
  }
}

# Si no se ha configurado ninguna variable real para MCP, notifica un error indicando rellenar el archivo .env
if ($loaded.Count -eq 0) {
  Write-Error "No se encontraron variables MCP válidas en .env."
}

# Registra las variables directamente en el entorno de usuario del sistema operativo para persistencia entre reinicios de terminal/IDE
foreach ($key in $loaded.Keys) {
  [Environment]::SetEnvironmentVariable($key, $loaded[$key], "User")
}

# Reporte visual del resultado del script en la consola
Write-Host "Cursor ha quedado preparado con acceso externo:"
Write-Host "- uv disponible para Jira MCP"
Write-Host "- Variables MCP sincronizadas en el entorno de usuario:"
$loaded.Keys | Sort-Object | ForEach-Object { Write-Host "  - $_" }

if ($skipped.Count -gt 0) {
  Write-Host "Variables MCP omitidas:"
  $skipped.Keys | Sort-Object | ForEach-Object { Write-Host "  - $_ ($($skipped[$_]))" }
}

Write-Host "Solo falta cerrar y volver a abrir Cursor."
