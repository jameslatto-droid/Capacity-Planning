# Engineering Resource Planner — PowerShell launcher
# Right-click → Run with PowerShell, or: powershell -File start.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host ""
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host "  Engineering Resource Planner" -ForegroundColor Cyan
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js (PowerShell inherits the correct PATH)
try {
    $nodeVer = node --version 2>&1
    Write-Host "  Node.js $nodeVer found." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found. Download from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
if (-not (Test-Path "node_modules\express")) {
    Write-Host "`n  Installing dependencies (first run only)..." -ForegroundColor Yellow
    npm install --prefer-offline
}

# Build app
if (-not (Test-Path "dist\index.html")) {
    Write-Host "`n  Building app (first run only)..." -ForegroundColor Yellow
    npm run build
}

# Seed data
if (-not (Test-Path "data\plan.json")) {
    if (Test-Path "data\plan.seed.json") {
        Write-Host "`n  Initialising plan data from seed..." -ForegroundColor Yellow
        Copy-Item "data\plan.seed.json" "data\plan.json"
    }
}

Write-Host "`n  Starting server — leave this window open.`n" -ForegroundColor Green
node server\index.js
