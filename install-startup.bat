@echo off
title Syam Infra - Setup Auto Start
color 0A

echo ===================================================
echo     SYAM INFRA - AUTOMATIC STARTUP INSTALLER
echo ===================================================
echo.
echo This will configure the computer to automatically run the 
echo Syam Infra Plan Folio in the background when it turns on.
echo.

set "startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "scriptPath=%~dp0run-syam-infra.vbs"
set "shortcutPath=%startupFolder%\SyamInfra.lnk"

echo [1/2] Creating system shortcut...
powershell -Command "$wshell = New-Object -ComObject WScript.Shell; $shortcut = $wshell.CreateShortcut('%shortcutPath%'); $shortcut.TargetPath = 'wscript.exe'; $shortcut.Arguments = '\"%scriptPath%\"'; $shortcut.WorkingDirectory = '%~dp0'; $shortcut.Save()"

echo [2/2] Setup Complete! 
echo.
echo You can now close this window. 
echo The application is permanently installed on this computer.
echo.
pause
