$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $envFile)) {
  Write-Error "No se encontró .env en la raíz del proyecto."
}

$uvCommand = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uvCommand) {
  Write-Host "uv no está instalado. Iniciando instalación..."
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
  $uvCommand = Get-Command uv -ErrorAction SilentlyContinue
  if (-not $uvCommand) {
    Write-Error "No se pudo instalar o detectar uv automáticamente. Reinicia la terminal y prueba de nuevo."
  }
}

$targetKeys = @(
  "GITHUB_TOKEN",
  "JIRA_URL",
  "JIRA_USERNAME",
  "JIRA_API_TOKEN",
  "POSTGRES_PRISMA_URL"
)

$loaded = @{}
$skipped = @{}

foreach ($line in Get-Content $envFile) {
  $trimmed = $line.Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#")) {
    continue
  }

  $separatorIndex = $trimmed.IndexOf("=")
  if ($separatorIndex -lt 1) {
    continue
  }

  $key = $trimmed.Substring(0, $separatorIndex).Trim()
  $value = $trimmed.Substring($separatorIndex + 1).Trim()

  if ($targetKeys -contains $key -and -not [string]::IsNullOrWhiteSpace($value)) {
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

if ($loaded.Count -eq 0) {
  Write-Error "No se encontraron variables MCP válidas en .env."
}

foreach ($key in $loaded.Keys) {
  [Environment]::SetEnvironmentVariable($key, $loaded[$key], "User")
}

Write-Host "Cursor ha quedado preparado con acceso externo:"
Write-Host "- uv disponible para Jira MCP"
Write-Host "- Variables MCP sincronizadas en el entorno de usuario:"
$loaded.Keys | Sort-Object | ForEach-Object { Write-Host "  - $_" }

if ($skipped.Count -gt 0) {
  Write-Host "Variables MCP omitidas:"
  $skipped.Keys | Sort-Object | ForEach-Object { Write-Host "  - $_ ($($skipped[$_]))" }
}

Write-Host "Solo falta cerrar y volver a abrir Cursor."
