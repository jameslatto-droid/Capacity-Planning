# Master Startup Script for Home LLM System
# Starts all services: Ollama Server, Web Server, and Stable Diffusion

Write-Host "=== Home LLM System Startup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Start web server for chat interface
Write-Host "1. Starting web chat interface on port 8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\LLM; python scripts\start-web-server.py"

Start-Sleep -Seconds 2

# 2. Start Ollama Server
Write-Host "2. Starting Ollama Server (port 11434)..." -ForegroundColor Green
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "$env:OLLAMA_HOST='0.0.0.0:11434'; $env:OLLAMA_ORIGINS='*'; ollama serve"
Start-Sleep -Seconds 3

Write-Host ""

# 3. Start Stable Diffusion WebUI
Write-Host "3. Starting Stable Diffusion WebUI on port 7860..." -ForegroundColor Green
Write-Host "   (First run will download models - this may take a while)" -ForegroundColor Yellow
$env:PYTHON = "C:\Users\jimla\AppData\Local\Programs\Python\Python310\python.exe"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\LLM\runners\stable-diffusion-webui; `$env:PYTHON = 'C:\Users\jimla\AppData\Local\Programs\Python\Python310\python.exe'; .\webui.bat --api --listen --xformers --no-half-vae"

Write-Host ""
Write-Host "=== Startup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor White
Write-Host "  - Chat Interface: http://192.168.1.66:8080/chat.html" -ForegroundColor Cyan
Write-Host "  - Ollama API: http://192.168.1.66:11434" -ForegroundColor Cyan
Write-Host "  - Stable Diffusion WebUI: http://192.168.1.66:7860" -ForegroundColor Cyan
Write-Host ""
Write-Host "From iPhone (same WiFi): http://192.168.1.66:8080/chat.html" -ForegroundColor Magenta
Write-Host ""
Write-Host "Try:" -ForegroundColor White
Write-Host "  - 'Hello, how are you?' (text chat)" -ForegroundColor Gray
Write-Host "  - 'Generate an image of a sunset over mountains' (image gen)" -ForegroundColor Gray
Write-Host "  - Upload photo + ask 'What's in this image?' (vision)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
