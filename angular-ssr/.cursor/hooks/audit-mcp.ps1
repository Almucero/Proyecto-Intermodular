$ErrorActionPreference = "SilentlyContinue"

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output '{}'
  exit 0
}

$payload = $inputJson | ConvertFrom-Json
$tool = [string]$payload.toolName
$server = [string]$payload.server
$arguments = $payload.arguments | ConvertTo-Json -Compress

$logDir = ".cursor/hooks/logs"
$logPath = ".cursor/hooks/logs/mcp-audit.log"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$line = "[$timestamp] server=$server tool=$tool args=$arguments"
Add-Content -Path $logPath -Value $line

Write-Output '{}'
exit 0
