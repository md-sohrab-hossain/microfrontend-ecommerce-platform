@echo off
REM Microfrontend E-commerce Development Startup Script for Windows
REM This script starts all microfrontends in development mode

echo 🚀 Starting Microfrontend E-commerce Development Environment
echo ============================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ to continue.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm to continue.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

echo.
echo 🔧 Installing all microfrontend dependencies...
npm run install:all

echo.
echo 🏗️  Building shared package...
cd shared
npm run build
cd ..

echo.
echo 🌐 Starting all development servers...
echo    - Container (React): http://localhost:3000
echo    - Products (Vue.js): http://localhost:3001
echo    - Cart (React): http://localhost:3002
echo    - Auth (React): http://localhost:3003
echo.

REM Start all services concurrently
npm run dev

echo.
echo 🎉 All services started successfully!
echo 📱 Open http://localhost:3000 to view the application
pause
