@echo off
title Engineering Resource Planner
color 0A

echo.
echo  ============================================
echo   Engineering Resource Planner
echo  ============================================
echo.

:: Move to the folder this script lives in (works from any location)
cd /d "%~dp0"

:: ── Check Node.js ─────────────────────────────────────────────────────────
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  ERROR: Node.js is not installed.
  echo.
  echo  Download it from: https://nodejs.org  (LTS version)
  echo  Then run this script again.
  echo.
  pause
  exit /b 1
)

:: ── Install dependencies if missing ───────────────────────────────────────
if not exist "node_modules" (
  echo  Installing dependencies (first run only, takes ~30s)...
  call npm install --prefer-offline
  if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
  echo.
)

:: ── Build app if dist/ is missing ─────────────────────────────────────────
if not exist "dist\index.html" (
  echo  Building app (first run only, takes ~15s)...
  call npm run build
  if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: Build failed.
    pause
    exit /b 1
  )
  echo.
)

:: ── Generate seed data if plan.json is missing ────────────────────────────
if not exist "data\plan.json" (
  echo  Initialising plan data from seed...
  if exist "data\plan.seed.json" (
    copy "data\plan.seed.json" "data\plan.json" >nul
    echo  Done.
  ) else (
    echo  WARNING: plan.seed.json not found. Starting with empty data.
  )
  echo.
)

:: ── Start server ──────────────────────────────────────────────────────────
echo  Starting server...
echo  (Leave this window open while using the app)
echo.
node server\index.js

pause
