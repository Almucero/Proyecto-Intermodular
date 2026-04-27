$ErrorActionPreference = "Stop"

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output '{"permission":"allow"}'
  exit 0
}

$payload = $inputJson | ConvertFrom-Json
$command = [string]$payload.command

if ($command -match 'rm -rf|git push --force') {
  Write-Output '{"permission":"ask","user_message":"Comando destructivo detectado. Confirma su ejecucion.","agent_message":"Se requiere confirmacion para comandos destructivos."}'
  exit 0
}

if ($command -match 'ng build --configuration production|npm publish') {
  Write-Output '{"permission":"ask","user_message":"Operacion de produccion detectada. Confirma antes de continuar.","agent_message":"Se requiere confirmacion para operaciones de produccion."}'
  exit 0
}

Write-Output '{"permission":"allow"}'
exit 0
