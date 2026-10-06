@echo off
setlocal
cd /d "%~dp0"
echo =================================================
echo   The Common Grounds - Full Software Audit
echo =================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js 22.x is required.
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODE_MAJOR=%%v
if not "%NODE_MAJOR%"=="22" (
  echo WARNING: This project is pinned to Node.js 22.x. Detected Node.js %NODE_MAJOR%.
  echo.
)

echo [1/4] Installing backend dependencies...
cd backend
call npm install --no-audit --no-fund --force --loglevel=warn
if errorlevel 1 goto :fail

echo [2/4] Running all backend integration tests...
call npm test
if errorlevel 1 goto :fail

cd ..
echo [3/4] Installing frontend dependencies...
echo This may take a few minutes on the first run. Please wait...
cd frontend
call npm install --no-audit --no-fund --force --loglevel=warn
if errorlevel 1 goto :fail

echo [4/4] Building frontend...
call npm run build
if errorlevel 1 goto :fail

cd ..
echo.
echo =================================================
echo   FULL AUDIT PASSED
echo =================================================
echo Backend integration tests: PASS
echo Frontend production build: PASS
echo.
echo The test suite uses a temporary database and does not modify real cafe data.
pause
exit /b 0

:fail
cd ..
echo.
echo =================================================
echo   FULL AUDIT FAILED / BLOCKED
echo =================================================
echo Review the npm output above for the exact failing step.
pause
exit /b 1
