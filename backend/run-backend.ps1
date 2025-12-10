# Backend Startup Script
# Make sure Go is installed first!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Weather Service Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Go is installed
Write-Host "Checking Go installation..." -ForegroundColor Yellow
try {
    $goVersion = go version 2>&1
    Write-Host "✓ Go is installed: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Go is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Go first:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://golang.org/dl/" -ForegroundColor White
    Write-Host "2. Download Windows installer" -ForegroundColor White
    Write-Host "3. Run installer" -ForegroundColor White
    Write-Host "4. Restart this terminal" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Check if API key is set
Write-Host "Checking API key..." -ForegroundColor Yellow
$mainGoContent = Get-Content "main.go" -Raw
if ($mainGoContent -match 'YOUR_OPENWEATHER_API_KEY') {
    Write-Host "⚠ WARNING: API key not set!" -ForegroundColor Yellow
    Write-Host "Please update main.go with your OpenWeatherMap API key" -ForegroundColor Yellow
    Write-Host "Get free API key from: https://openweathermap.org/api" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✓ API key appears to be set" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
go mod download
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run the server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "Server will run on: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

go run main.go

