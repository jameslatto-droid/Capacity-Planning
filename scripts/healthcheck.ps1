$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
Set-Location $repoRoot

Write-Host "Docker status:" -ForegroundColor Cyan
docker compose ps

Write-Host "Testing LibreChat UI reachability..." -ForegroundColor Green
try {
    $respCode = (Invoke-WebRequest -Uri 'http://localhost:3080' -UseBasicParsing -TimeoutSec 5).StatusCode
    Write-Host "LibreChat UI HTTP $respCode" -ForegroundColor Green
} catch {
    Write-Warning "LibreChat UI not reachable: $($_.Exception.Message)"
}

Write-Host "Testing Ollama connectivity from container network..." -ForegroundColor Green
try {
    $code = docker run --rm --network librechat-net curlimages/curl:8.5.0 -s -o /dev/null -w "%{http_code}" http://host.docker.internal:11434/api/tags
    if ($code -eq "200") {
        Write-Host "Ollama reachable from containers (HTTP 200)." -ForegroundColor Green
    } else {
        Write-Warning "Ollama reachable check returned HTTP $code"
    }
} catch {
    Write-Warning "Ollama not reachable from container network. Check port 11434 and firewall."
}

Write-Host "Port probes (LAN):" -ForegroundColor Cyan
$ports = @(
    @{Host='localhost';Port=3080;Name='LibreChat UI'},
    @{Host='localhost';Port=11434;Name='Ollama host'},
    @{Host='localhost';Port=7860;Name='Stable Diffusion (if running)'}
)
foreach ($p in $ports) {
    $result = Test-NetConnection -ComputerName $p.Host -Port $p.Port -WarningAction SilentlyContinue
    $status = if ($result.TcpTestSucceeded) { 'open' } else { 'closed' }
    Write-Host " - $($p.Name) $($p.Host):$($p.Port) => $status"
}
