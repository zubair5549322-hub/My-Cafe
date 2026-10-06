@echo off
setlocal enabledelayedexpansion
title The Common Grounds - Connect
cd /d "%~dp0"

:: This is a standalone launcher for OTHER computers/tablets in the cafe.
:: It does NOT run its own copy of the software - only ONE PC (the till PC)
:: should ever run Start-Cafe.bat. Every other device just needs this single
:: file - copy it anywhere (USB stick, email, shared folder) - no Node.js,
:: no project folder, nothing else required.

set CONFIG_FILE=%~dp0cafe-server-address.txt

if exist "%CONFIG_FILE%" (
    set /p SERVER_ADDRESS=<"%CONFIG_FILE%"
) else (
    echo =================================================
    echo   Connect to The Common Grounds Cafe Software
    echo =================================================
    echo.
    echo This computer needs to know the address of the till PC
    echo running the cafe software - shown in ITS terminal window
    echo as "Network access: http://xxx.xxx.xxx.xxx:4000"
    echo.
    set /p SERVER_ADDRESS="Enter that address now (e.g. http://192.168.1.50:4000): "
    echo !SERVER_ADDRESS!>"%CONFIG_FILE%"
    echo.
    echo Saved. This file won't ask again next time.
    echo ^(To change it later, edit or delete cafe-server-address.txt in this folder^)
    echo.
)

echo Opening !SERVER_ADDRESS! ...
start "" "!SERVER_ADDRESS!"

timeout /t 3 >nul
