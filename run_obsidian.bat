@echo off
title Obsidian Launcher (SIH PS-26151)
echo ===================================================
echo   OBSIDIAN: DARK WEB DE-ANONYMIZATION PLATFORM
echo ===================================================

cd /d D:\Obsidian

echo [1/3] Ensuring Docker Tor Testbed is up...
docker compose up -d

echo [2/3] Launching FastAPI Backend on port 8000...
start "Obsidian Backend (FastAPI :8000)" cmd /k "cd /d D:\Obsidian && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [3/3] Launching React Dashboard on port 3000...
start "Obsidian Dashboard (React :3000)" cmd /k "cd /d D:\Obsidian && npm run dev"

echo.
echo All services starting up!
echo Opening http://localhost:3000 in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
