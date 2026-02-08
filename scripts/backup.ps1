$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
Set-Location $repoRoot

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $repoRoot 'backups'
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Force -Path $backupDir | Out-Null }

Write-Host "Creating MongoDB dump..." -ForegroundColor Green
$mongoArchiveContainer = "/data/mongo-$timestamp.archive"
docker compose exec mongo mongodump --archive=$mongoArchiveContainer | Out-Null
docker compose cp "mongo:$mongoArchiveContainer" "$backupDir/mongo-$timestamp.archive"
docker compose exec mongo rm -f $mongoArchiveContainer | Out-Null

Write-Host "Archiving uploads/logs..." -ForegroundColor Green
$zipPath = "$backupDir/librechat-files-$timestamp.zip"
$pathsToZip = @(
    "data/librechat/uploads",
    "data/librechat/logs",
    "data/librechat/userdata"
) | ForEach-Object { Join-Path $repoRoot $_ }
Compress-Archive -Path $pathsToZip -DestinationPath $zipPath -Force

Write-Host "Backup complete: $backupDir" -ForegroundColor Cyan
