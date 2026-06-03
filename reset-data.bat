@echo off
echo.
echo  This will reset ALL planning data back to the original seed data.
echo  Your current plan.json will be overwritten.
echo.
set /p confirm="  Type YES to confirm: "
if /i "%confirm%" neq "YES" (
  echo  Cancelled.
  pause
  exit /b 0
)
cd /d "%~dp0"
copy "data\plan.seed.json" "data\plan.json" >nul
echo.
echo  Data reset to seed. Refresh your browser.
echo.
pause
