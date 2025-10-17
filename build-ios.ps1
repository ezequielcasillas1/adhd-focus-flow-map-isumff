# iOS Development Build Script
# Run this script in a new PowerShell window

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Flow Focus - iOS Development Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking EAS authentication..." -ForegroundColor Yellow
$username = eas whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Logged in as: $username" -ForegroundColor Green
} else {
    Write-Host "✗ Not logged in to EAS" -ForegroundColor Red
    Write-Host "Running: eas login" -ForegroundColor Yellow
    eas login
}

Write-Host ""
Write-Host "Step 1: Initialize EAS Project" -ForegroundColor Cyan
Write-Host "This will create an EAS project and link it to your Expo account" -ForegroundColor Gray
Write-Host ""
eas init

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ EAS init failed. Please check errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ EAS project initialized!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Build iOS Development Client" -ForegroundColor Cyan
Write-Host "This will take 15-20 minutes. You'll be prompted for Apple credentials." -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Ready to start build? This will take ~20 minutes (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Build cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Starting iOS build..." -ForegroundColor Yellow
eas build --profile development --platform ios

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Build completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Download the .ipa file from the link above" -ForegroundColor White
    Write-Host "2. Open it on your iPhone to install" -ForegroundColor White
    Write-Host "3. Trust the developer certificate:" -ForegroundColor White
    Write-Host "   Settings > General > VPN & Device Management" -ForegroundColor Gray
    Write-Host "4. Run 'npm start' in this project" -ForegroundColor White
    Write-Host "5. Open Flow Focus app on your device" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Build failed. Please check errors above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Apple Developer account required ($99/year)" -ForegroundColor Gray
    Write-Host "- Check Apple credentials are correct" -ForegroundColor Gray
    Write-Host "- View docs/IOS_BUILD_SETUP.md for troubleshooting" -ForegroundColor Gray
    Write-Host ""
}

