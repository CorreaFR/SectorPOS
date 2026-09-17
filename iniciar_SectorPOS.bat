@echo off
title SectorPOS - Iniciador
echo ==========================================
echo       Iniciando SectorPOS
echo ==========================================
echo.

echo [1/2] Iniciando Backend (.NET API)...
cd /d "%~dp0SectorPOS.API"
start "SectorPOS - API Backend" cmd /c "dotnet run"

echo [2/2] Iniciando Frontend (React Vite)...
cd /d "%~dp0SectorPOS.Frontend"
start "SectorPOS - Frontend" cmd /c "npm run dev"

echo.
echo ==========================================
echo Servidores iniciados en ventanas separadas.
echo Backend API: http://localhost:5129
echo Frontend:    http://localhost:5173
echo ==========================================
pause
