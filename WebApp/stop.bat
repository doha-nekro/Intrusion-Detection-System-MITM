@echo off
REM ============================================================================
REM Synapse IDS - Application Stopper
REM Stops all running Backend and Frontend servers
REM ============================================================================

echo.
echo ========================================
echo   Synapse IDS - Stopping...
echo ========================================
echo.

echo Stopping Backend Server (Python/Uvicorn)...
taskkill /FI "WindowTitle eq Synapse IDS Backend*" /T /F >nul 2>&1
if errorlevel 1 (
    echo Backend server not running or already stopped.
) else (
    echo Backend server stopped successfully.
)

echo.
echo Stopping Frontend Server (Node/Vite)...
taskkill /FI "WindowTitle eq Synapse IDS Frontend*" /T /F >nul 2>&1
if errorlevel 1 (
    echo Frontend server not running or already stopped.
) else (
    echo Frontend server stopped successfully.
)

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause
