@echo off
title The Common Grounds - Cafe Management Software
cd /d "%~dp0backend"

echo =================================================
echo   The Common Grounds - Cafe Management Software
echo =================================================
echo.

rem Validate the actual SQLite native binding instead of only checking whether
rem a folder exists. Older/incomplete node_modules folders can otherwise cause
rem npm to rebuild a stale better-sqlite3 package with node-gyp.
set "BACKEND_OK=0"
if exist "node_modules\better-sqlite3" (
    node -e "const D=require('better-sqlite3'); const d=new D(':memory:'); d.prepare('select 1').get(); d.close();" >nul 2>&1
    if not errorlevel 1 set "BACKEND_OK=1"
)

if "%BACKEND_OK%"=="0" (
    echo First-time setup: installing backend components...
    echo.
    echo This application uses the Windows-friendly better-sqlite3 12.11.1
    echo line with published Node.js 22 prebuilds.
    echo The installer will use the bundled/prebuilt SQLite binary whenever
    echo available instead of compiling from source.
    echo.
    call npm install --no-audit --no-fund --force
    if errorlevel 1 (
        echo.
        echo ERROR: Backend dependency installation failed.
        echo.
        echo If this project is stored inside OneDrive, close any running
        echo Node.js/VS Code windows using this project and run Start-Cafe.bat
        echo again. OneDrive can temporarily lock files inside node_modules.
        pause
        exit /b 1
    )
)

rem Verify the native SQLite module after installation. This is the actual
rem compatibility check for Node.js 22 on Windows x64.
node -e "const D=require('better-sqlite3'); const d=new D(':memory:'); d.prepare('select 1').get(); d.close();" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: better-sqlite3 could not load after installation.
    echo Node.js 22 is required. If npm reported EPERM or node-gyp errors,
    echo close Node.js/VS Code and retry from a normal local folder such as
    echo C:\TheCommonGrounds rather than a OneDrive-synced Desktop folder.
    pause
    exit /b 1
)

rem Do not trust a node_modules directory by itself. A previous packaged
rem build may contain empty/incomplete node_modules folders. Vite must
rem actually be present before we attempt the build.
cd /d "%~dp0frontend"
if not exist "node_modules\vite\bin\vite.js" (
    echo Installing frontend components...
    echo This may take a few minutes on the first run. Please wait...
    echo Frontend: React + Vite dependencies are being installed now.
    if exist "node_modules" rmdir /s /q "node_modules"
    call npm install --no-audit --no-fund --force --loglevel=warn
    if errorlevel 1 (
        echo ERROR: Frontend npm install failed.
        echo Check your internet connection and npm output above.
        pause
        exit /b 1
    )
)

if not exist "node_modules\vite\bin\vite.js" (
    echo ERROR: Vite was not installed correctly.
    echo Please delete the frontend\node_modules folder and run Start-Cafe.bat again.
    pause
    exit /b 1
)

rem ALWAYS build the frontend from source. The ZIP may contain an older
rem dist folder, which can hide newly added modules such as HR & Payroll.
cd /d "%~dp0frontend"

rem The build script is defined in frontend\package.json. Do not mutate
rem package.json at runtime; doing so can break npm on some Windows setups.
echo Building frontend from current source...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed.
    echo Node.js 22.x is supported. Check the build error above.
    pause
    exit /b 1
)
cd /d "%~dp0backend"

if not exist "data\cafe.db" (
    echo First-time setup: creating the database with default users and sample menu...
    call npm run seed
)

echo.
echo Starting the server... Keep this window open while the cafe is running.
echo Once it says "Local access", open that address in your browser.
echo.
call npm start

pause
