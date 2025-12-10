# Start Weather Service Backend
# Make sure Go is in PATH

Write-Host "Starting Weather Service Backend..." -ForegroundColor Cyan
Write-Host ""

# Add Go to PATH if not already there
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    $env:PATH += ";C:\Program Files\Go\bin"
    Write-Host "Added Go to PATH for this session" -ForegroundColor Yellow
}

# Check Go
Write-Host "Checking Go installation..." -ForegroundColor Yellow
go version
Write-Host ""

# Install dependencies
Write-Host "Installing/updating dependencies..." -ForegroundColor Yellow
go mod tidy
Write-Host ""

# Run the server
Write-Host "Starting server on http://localhost:8081" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

go run main.go

