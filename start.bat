@echo off
chcp 65001 >nul
echo ========================================
echo   Energy Storage Investment Analysis
echo ========================================
echo.

cd /d "%~dp0energy-storage-app"

echo [1/2] Checking dependencies...
if not exist "node_modules" (
    echo First run, installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies. Please check if Node.js is installed.
        pause
        exit /b 1
    )
)

echo [2/2] Starting development server...
echo.
echo Port: 5263
echo URL:  http://localhost:5263
echo.
npm run dev