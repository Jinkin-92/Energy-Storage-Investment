@echo off
chcp 65001 >nul
echo ========================================
echo   储能投资分析系统 - 启动脚本
echo   Energy Storage Investment Analysis System
echo ========================================
echo.

cd /d "%~dp0energy-storage-app"

echo [1/2] 检查依赖...
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查 Node.js 是否已安装
        pause
        exit /b 1
    )
)

echo [2/2] 启动开发服务器...
echo.
echo 端口: 5263
echo 地址: http://localhost:5263
echo.
npm run dev