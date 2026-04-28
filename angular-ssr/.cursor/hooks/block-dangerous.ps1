$ErrorActionPreference = "Stop"

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output '{"permission":"allow"}'
  exit 0
}

$payload = $inputJson | ConvertFrom-Json
$command = [string]$payload.command

$patterns = @(
  '(^|\s)rm\s+-rf\s+/',
  '(^|\s)rm\s+-rf\s+',
  '(^|\s)del\s+',
  '(^|\s)erase\s+',
  '(^|\s)rd\s+/s\s+/q',
  'Remove-Item\s+.+-Recurse\s+.+-Force',
  'git\s+clean\s+-fd',
  'DROP\s+TABLE',
  'DROP\s+DATABASE',
  'git\s+push.*--force.*\b(main|master)\b',
  'git\s+reset\s+--hard',
  'format\s+[a-z]:',
  'diskpart',
  'ng\s+build\s+--configuration\s+production',
  'npm\s+publish'
)

foreach ($pattern in $patterns) {
  if ($command -match $pattern) {
    Write-Output '{"permission":"ask","user_message":"Comando potencialmente destructivo detectado. Confirma explicitamente si quieres ejecutarlo.","agent_message":"Hook de seguridad: se requiere confirmacion explicita para comandos destructivos."}'
    exit 0
  }
}

Write-Output '{"permission":"allow"}'
exit 0
