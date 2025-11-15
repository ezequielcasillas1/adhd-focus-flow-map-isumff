@echo off
echo ========================================
echo Deploying Secure Freesound API to Supabase
echo ========================================
echo.

echo Step 1: Linking Supabase project...
call npx supabase link --project-ref brwhhkmjyadcaasqggtd
if errorlevel 1 (
    echo ERROR: Failed to link project
    pause
    exit /b 1
)
echo.

echo Step 2: Setting Freesound API secrets...
call npx supabase secrets set FREESOUND_CLIENT_ID=p2LQTl6ruVcDyK8yoVJ3
if errorlevel 1 (
    echo ERROR: Failed to set CLIENT_ID
    pause
    exit /b 1
)

call npx supabase secrets set FREESOUND_CLIENT_SECRET=dicOJ7BihTzR8dGXVxSTUhUR4j2oLJrf2BJdBMwH
if errorlevel 1 (
    echo ERROR: Failed to set CLIENT_SECRET
    pause
    exit /b 1
)
echo.

echo Step 3: Deploying Edge Function...
call npx supabase functions deploy freesound-download
if errorlevel 1 (
    echo ERROR: Failed to deploy function
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS! Edge Function deployed!
echo ========================================
echo.
echo Your API keys are now safely stored on Supabase servers.
echo.
echo Next: Update your app to use the secure service
echo.
pause

