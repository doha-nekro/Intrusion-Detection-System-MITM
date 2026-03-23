@echo off
REM ============================================================================
REM Synapse IDS - Application Launcher
REM Launches both Backend (FastAPI) and Frontend (Vite) servers
REM ============================================================================

echo.
echo ========================================
echo   Synapse IDS - Starting...
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "backend\main.py" (
    echo ERROR: backend\main.py not found!
    echo Please run this script from the WebApp root directory.
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: frontend\package.json not found!
    echo Please run this script from the WebApp root directory.
    pause
    exit /b 1
)

REM Create log directory if it doesn't exist
if not exist "logs" mkdir logs

echo [1/6] Checking Python environment...
set "PYTHON_CMD=python"
set "PYTHON_BACKEND_CMD=python"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=.venv\Scripts\python.exe"
    set "PYTHON_BACKEND_CMD=..\.venv\Scripts\python.exe"
    echo      Using project virtual environment: .venv
)

%PYTHON_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo      Python found!

echo.
echo [2/6] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo      Node.js found!

echo.
echo [3/6] Checking Frontend dependencies...
if not exist "frontend\node_modules" (
    echo      Dependencies not found. Installing...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo      Frontend dependencies installed successfully!
) else (
    echo      Frontend dependencies already installed.
)

echo.
echo [4/6] Checking Backend dependencies...
%PYTHON_CMD% -c "import fastapi, uvicorn, pandas, sklearn, joblib, multipart, websockets" >nul 2>&1
if errorlevel 1 (
    echo      Backend dependencies missing. Installing from backend\requirements.txt...
    %PYTHON_CMD% -m pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo      Backend dependencies installed successfully!
) else (
    echo      Backend dependencies already installed.
)

echo.
echo [5/6] Starting Backend Server (FastAPI)...
echo      Backend will run on: http://localhost:8000
start "Synapse IDS Backend" cmd /k "cd backend && %PYTHON_BACKEND_CMD% -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo.
echo [6/6] Starting Frontend Server (Vite)...
echo      Frontend will run on: http://localhost:5173
start "Synapse IDS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Synapse IDS - Running!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the frontend in default browser
start http://localhost:5173

echo.
echo Application is running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
