@echo off
echo Installing Emineon Outlook Add-in...

set MANIFEST_PATH=%~dp0manifest-local.xml
set ADDIN_ID=emineon-email-addin-local-dev

echo Manifest path: %MANIFEST_PATH%

REM Add to registry for current user
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\Developer\%ADDIN_ID%" /v "UseDirectDebugManifests" /t REG_DWORD /d 1 /f
reg add "HKCU\Software\Microsoft\Office\16.0\WEF\Developer\%ADDIN_ID%\DesktopFormFactor" /v "SourceLocation" /t REG_SZ /d "file:///%MANIFEST_PATH%" /f

echo Add-in installed successfully!
echo Please restart Outlook to see the changes.
pause
