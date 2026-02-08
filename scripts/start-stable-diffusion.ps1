# Stable Diffusion (Option A) quick launcher for host
# Runs Automatic1111 with API enabled on port 7860 in a visible window

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
$sdRoot  = Join-Path $repoRoot "runners\stable-diffusion-webui"
$sdRepoPath = Join-Path $sdRoot "repositories\stable-diffusion-stability-ai"

# If port already open, skip
$portOpen = (Test-NetConnection -ComputerName localhost -Port 7860 -WarningAction SilentlyContinue).TcpTestSucceeded
if ($portOpen) {
    Write-Host "Stable Diffusion already listening on 7860; skipping launch." -ForegroundColor Yellow
    exit 0
}

Set-Location $sdRoot

if (-not (Test-Path "webui.bat")) {
    Write-Host "webui.bat not found. Ensure A1111 is installed in runners/stable-diffusion-webui." -ForegroundColor Red
    exit 1
}

# Ensure upstream repo exists; only reset if missing
if (-not (Test-Path $sdRepoPath)) {
    Write-Host "Cloning stable-diffusion repo from w-e-w mirror (one-time)..." -ForegroundColor Yellow
} else {
    Write-Host "Using existing stable-diffusion repo at $sdRepoPath" -ForegroundColor Cyan
}
$env:STABLE_DIFFUSION_REPO = "https://github.com/w-e-w/stablediffusion.git"
$env:STABLE_DIFFUSION_COMMIT_HASH = "cf1d67a6fd5ea1aa600c4df58e5b47da45f6bdbf"

# Prefer pinned Python if present; else let webui.bat manage venv
$pythonPath = "C:\Users\jimla\AppData\Local\Programs\Python\Python310\python.exe"
if (Test-Path $pythonPath) { $env:PYTHON = $pythonPath }
$env:COMMANDLINE_ARGS = "--api --listen --xformers --no-half-vae --skip-version-check"

Write-Host "Starting Automatic1111 on port 7860 with API enabled..." -ForegroundColor Green
Start-Process powershell -WindowStyle Normal -ArgumentList "-NoExit","-Command","cd `"$sdRoot`"; .\webui.bat --api --listen --xformers --no-half-vae"
