@echo off
REM Start the React frontend dev server.
setlocal
cd /d "%~dp0\frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies first...
    call npm install --include=dev
)

npm run dev
