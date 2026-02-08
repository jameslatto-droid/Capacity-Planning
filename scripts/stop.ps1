$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
Set-Location $repoRoot

Write-Host "Stopping LibreChat stack..." -ForegroundColor Yellow
docker compose down
