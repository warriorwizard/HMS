@echo off
setlocal

set "ROOT_DIR=%~dp0"

if not exist "%ROOT_DIR%backend" (
  echo [ERROR] backend folder not found at "%ROOT_DIR%backend"
  exit /b 1
)

if not exist "%ROOT_DIR%frontend" (
  echo [ERROR] frontend folder not found at "%ROOT_DIR%frontend"
  exit /b 1
)

echo Starting backend on http://127.0.0.1:8000
start "LIMS Backend" cmd /k "cd /d ""%ROOT_DIR%backend"" && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo Starting frontend on http://127.0.0.1:3000
start "LIMS Frontend" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev -- --hostname 127.0.0.1 --port 3000"

echo Both services are launching in separate windows.

endlocal
