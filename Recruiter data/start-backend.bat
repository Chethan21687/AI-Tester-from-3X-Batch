@echo off
REM Start the FastAPI backend.
setlocal
cd /d "%~dp0"

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
