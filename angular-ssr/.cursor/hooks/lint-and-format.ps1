$ErrorActionPreference = "SilentlyContinue"

$inputJson = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputJson)) {
  Write-Output '{}'
  exit 0
}

$payload = $inputJson | ConvertFrom-Json
$path = [string]$payload.path
if ([string]::IsNullOrWhiteSpace($path) -or -not (Test-Path $path)) {
  Write-Output '{}'
  exit 0
}

if ($path -match '\.ts$|\.html$|\.scss$') {
  npx prettier --write "$path" | Out-Null
}

if ($path -match '\.ts$') {
  npx eslint --fix "$path" | Out-Null
}

Write-Output '{}'
exit 0
