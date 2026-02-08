param(
    [switch]$WithSD
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
Set-Location $repoRoot

if (-not (Test-Path "$repoRoot/.env")) {
    Write-Host "Missing .env. Run scripts/setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Ensure data dirs exist
$dirs = @(
    "$repoRoot/data/librechat/uploads",
    "$repoRoot/data/librechat/logs",
    "$repoRoot/data/librechat/cache",
    "$repoRoot/data/librechat/userdata",
    "$repoRoot/data/mongo",
    "$repoRoot/data/redis",
    "$repoRoot/data/meili",
    "$repoRoot/backups"
)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

Write-Host "Starting LibreChat stack..." -ForegroundColor Green
docker compose up -d --remove-orphans

if ($WithSD) {
    $sdScript = Join-Path $repoRoot "scripts/start-stable-diffusion.ps1"
    if (Test-Path $sdScript) {
        Write-Host "Launching Stable Diffusion (Automatic1111)..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$sdScript`""
    } else {
        Write-Warning "start-stable-diffusion.ps1 not found; skipping Stable Diffusion."
    }
}

Write-Host "Stack starting. UI: http://192.168.1.66:3080" -ForegroundColor Cyan
