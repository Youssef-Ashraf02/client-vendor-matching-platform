# Setup script to create .env file from template
# This script helps users set up their environment configuration

param(
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if .env already exists
if (Test-Path ".env") {
    if (-not $Force) {
        Write-Warning ".env file already exists!"
        $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
        if ($overwrite -ne "y" -and $overwrite -ne "Y") {
            Write-Info "Setup cancelled."
            exit 0
        }
    }
}

Write-Info "Setting up .env file from template..."

# Copy from example
Copy-Item "env.example" ".env"

# Generate secure passwords
$MYSQL_ROOT_PASSWORD = -join ((1..25) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
$MYSQL_PASSWORD = -join ((1..25) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
$JWT_SECRET = -join ((1..50) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
$REFRESH_TOKEN_SECRET = -join ((1..50) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})

# Update .env with generated values
$envContent = Get-Content ".env"
$envContent = $envContent -replace "your_mysql_root_password_here", $MYSQL_ROOT_PASSWORD
$envContent = $envContent -replace "your_mysql_password_here", $MYSQL_PASSWORD
$envContent = $envContent -replace "your_jwt_secret_here", $JWT_SECRET
$envContent = $envContent -replace "your_refresh_token_secret_here", $REFRESH_TOKEN_SECRET
$envContent | Set-Content ".env"

Write-Success ".env file created successfully!"
Write-Warning "IMPORTANT: Please update the following values in .env:"
Write-Host "  - MONGO_URI: Replace with your MongoDB Atlas connection string"
Write-Host "  - SMTP_USER and SMTP_PASS: Configure your email service"
Write-Host "  - ADMIN_EMAIL: Set your admin email address"
Write-Host ""
Write-Info "You can now run: .\deploy.ps1"
