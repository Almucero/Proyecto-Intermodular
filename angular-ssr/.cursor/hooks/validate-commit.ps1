$ErrorActionPreference = "Stop"

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output '{"permission":"allow"}'
  exit 0
}

$payload = $inputJson | ConvertFrom-Json
$command = [string]$payload.command

$regex = 'git\s+commit\s+.*-m\s+"(feat|fix|refactor|docs|style|test|chore)\([A-Z]+-\d+\):\s+.+?"'

if ($command -notmatch 'git\s+commit') {
  Write-Output '{"permission":"allow"}'
  exit 0
}

if ($command -match $regex) {
  Write-Output '{"permission":"allow"}'
  exit 0
}

Write-Output '{"permission":"deny","user_message":"Commit bloqueado: formato requerido tipo(CLAVE-123): descripcion","agent_message":"Formato esperado: feat(CURSO-4): añadir feature de productos"}'
exit 2
