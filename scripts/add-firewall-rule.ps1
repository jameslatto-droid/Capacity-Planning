# Ollama Server Firewall Rule
# Right-click this file and select "Run with PowerShell" as Administrator

Write-Host "Adding firewall rule for Ollama Server..." -ForegroundColor Green

try {
    New-NetFirewallRule -DisplayName "Ollama Server" -Direction Inbound -LocalPort 11434 -Protocol TCP -Action Allow -ErrorAction Stop
    Write-Host "SUCCESS! Firewall rule added. Your iPhone can now connect." -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you ran this as Administrator!" -ForegroundColor Yellow
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
