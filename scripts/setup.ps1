param(
    [switch]$ForceEnv
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
Set-Location $repoRoot

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

$envFile = Join-Path $repoRoot '.env'
$envExample = Join-Path $repoRoot '.env.example'
if ((-not (Test-Path $envFile)) -or $ForceEnv) {
    Copy-Item $envExample $envFile -Force
    Write-Host "Created .env from .env.example. Update secrets before starting." -ForegroundColor Yellow
} else {
    Write-Host ".env already exists. Use -ForceEnv to overwrite from template." -ForegroundColor Cyan
}

Write-Host "Pulling container images..." -ForegroundColor Green
docker compose pull

Write-Host "Setup complete. Next: edit .env with real secrets, then run scripts/start.ps1" -ForegroundColor Green
