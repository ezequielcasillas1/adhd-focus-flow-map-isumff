@echo off
echo ========================================
echo Flow Focus - iOS Development Build
echo ========================================
echo.

echo Checking EAS authentication...
eas whoami
if errorlevel 1 (
    echo Not logged in. Running eas login...
    eas login
)

echo.
echo Step 1: Initialize EAS Project
echo.
eas init

if errorlevel 1 (
    echo Build process failed at initialization.
    pause
    exit /b 1
)

echo.
echo Step 2: Build iOS Development Client
echo This will take 15-20 minutes...
echo.
eas build --profile development --platform ios

echo.
echo ========================================
echo Build process completed!
echo ========================================
echo.
echo Next steps:
echo 1. Download the .ipa file from the link above
echo 2. Install on your iPhone
echo 3. Trust certificate in Settings
echo 4. Run 'npm start'
echo.
pause

