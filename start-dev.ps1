# Reox POS - Development Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reox POS - Electron Development Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping any running Node processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "[2/3] Starting backend server (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node index.js"
Start-Sleep -Seconds 5

Write-Host "[3/3] Starting Electron app..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend is running on: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host "Frontend will run on: http://127.0.0.1:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run electron:dev
