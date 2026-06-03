@echo off
title Engineering Resource Planner
color 0A

echo.
echo  ============================================
echo   Engineering Resource Planner
echo  ============================================
echo.

:: Move to the folder this script lives in
cd /d "%~dp0"

:: ── Refresh PATH from registry ─────────────────────────────────────────────
:: Explorer double-click uses a stale PATH — read fresh values from registry.
for /f "skip=2 tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USR_PATH=%%b"
for /f "skip=2 tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYS_PATH=%%b"
if defined SYS_PATH set "PATH=%SYS_PATH%"
if defined USR_PATH set "PATH=%PATH%;%USR_PATH%"

:: ── Also check common Node.js install locations ───────────────────────────
if exist "C:\Program Files\nodejs\node.exe"       set "PATH=%PATH%;C:\Program Files\nodejs"
if exist "C:\Program Files (x86)\nodejs\node.exe" set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
:: nvm-windows
if exist "%APPDATA%\nvm"          for /d %%v in ("%APPDATA%\nvm\v*") do set "PATH=%PATH%;%%v"
if exist "%ProgramFiles%\nvm"     for /d %%v in ("%ProgramFiles%\nvm\v*") do set "PATH=%PATH%;%%v"

:: ── Verify Node.js ─────────────────────────────────────────────────────────
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  ERROR: Node.js not found.
  echo.
  echo  It may not be installed, or the PATH was not updated.
  echo  Try one of:
  echo.
  echo    1. Download Node.js from https://nodejs.org  (LTS version^)
  echo       then restart and run this script again.
  echo.
  echo    2. Run this instead (works in VS Code terminal^):
  echo           npm run build  then  node server\index.js
  echo.
  pause
  exit /b 1
)

for /f %%v in ('node --version') do echo  Node.js %%v found.
echo.

:: ── Install dependencies if missing ───────────────────────────────────────
if not exist "node_modules\express" (
  echo  Installing dependencies (first run only, ~30s^)...
  call npm install --prefer-offline
  if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: npm install failed.
    pause
    exit /b 1
  )
  echo.
)

:: ── Build app if dist/ is missing ─────────────────────────────────────────
if not exist "dist\index.html" (
  echo  Building app (first run only, ~15s^)...
  call npm run build
  if %ERRORLEVEL% neq 0 (
    echo  ERROR: Build failed.
    pause
    exit /b 1
  )
  echo.
)

:: ── Seed plan.json if missing ─────────────────────────────────────────────
if not exist "data\plan.json" (
  echo  Initialising plan data from seed...
  if exist "data\plan.seed.json" (
    copy /y "data\plan.seed.json" "data\plan.json" >nul
    echo  Done.
  ) else (
    echo  WARNING: plan.seed.json not found. App will start with empty data.
  )
  echo.
)

:: ── Start server ──────────────────────────────────────────────────────────
echo  Starting server — leave this window open.
echo.
node server\index.js

pause
