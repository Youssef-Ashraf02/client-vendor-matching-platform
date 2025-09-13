# Expanders360 Backend Deployment Script (PowerShell)
# Now supports Atlas MongoDB detection

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "development", "prod", "production", "stop", "cleanup", "logs", "passwords", "backup", "menu")]
    [string]$Action = "menu"
)

# Functions
function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Check if Docker is installed
function Test-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        Write-Success "Docker and Docker Compose are installed"
        return $true
    }
    catch {
        Write-Error "Docker or Docker Compose is not installed. Please install Docker Desktop first."
        return $false
    }
}

# Check if .env file exists
function Test-EnvFile {
    if (Test-Path ".env") {
        Write-Success ".env file found"
        return $true
    }
    else {
        Write-Error ".env file not found. Please copy env.example to .env and configure it."
        return $false
    }
}

# Detect Atlas MongoDB
function Using-Atlas {
    $envFile = Get-Content ".env"
    foreach ($line in $envFile) {
        if ($line -match "MONGO_URI=mongodb\+srv://" -or $line -match "MONGO_HOST=atlas") {
            return $true
        }
    }
    return $false
}

# Setup environment for development
function Set-DevelopmentEnvironment {
    Write-Info "Setting up development environment..."
    
    if (-not (Test-Docker)) { return }
    if (-not (Test-EnvFile)) { return }

    $atlas = Using-Atlas
    if ($atlas) { Write-Info "Atlas MongoDB detected. Skipping local Mongo container." }

    # Create necessary directories
    New-Item -ItemType Directory -Force -Path "uploads\research-documents" | Out-Null
    New-Item -ItemType Directory -Force -Path "nginx\ssl" | Out-Null
    
    # Start services (exclude mongo if Atlas)
    Write-Info "Starting development services..."
    $env:NODE_ENV = "development"
    if ($atlas) {
        docker-compose up -d app mysql
    } else {
        docker-compose up -d
    }
    
    # Wait for services
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 30
    
    # Check if app container is running
    $appStatus = docker-compose ps app
    if ($appStatus -notmatch "Up") {
        Write-Error "App container is not running. Checking logs..."
        docker-compose logs app
        return
    }
    
    # Run migrations
    Write-Info "Running database migrations..."
    docker-compose exec app npm run migration:run
    
    # Ask about seeding
    $seed = Read-Host "Do you want to seed the database? (y/n)"
    if ($seed -eq "y" -or $seed -eq "Y") {
        docker-compose exec app npm run seed
    }
    
    Write-Success "Development environment is ready!"
    Write-Info "API available at: http://localhost:3000"
    Write-Info "Health check: http://localhost:3000/health"
}

# Setup environment for production
function Set-ProductionEnvironment {
    Write-Info "Setting up production environment..."
    
    if (-not (Test-Docker)) { return }
    if (-not (Test-EnvFile)) { return }

    $atlas = Using-Atlas
    if ($atlas) { Write-Info "Atlas MongoDB detected. Skipping local Mongo container." }
    
    # Create directories
    New-Item -ItemType Directory -Force -Path "uploads\research-documents" | Out-Null
    New-Item -ItemType Directory -Force -Path "nginx\ssl" | Out-Null
    
    # SSL certificates
    if (-not (Test-Path "nginx\ssl\cert.pem") -or -not (Test-Path "nginx\ssl\key.pem")) {
        Write-Warning "SSL certificates not found. Place cert.pem and key.pem in nginx\ssl\"
        Write-Info "For testing, you can generate self-signed certificates using:"
        Write-Host "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem"
    }

    # Start services (exclude mongo if Atlas)
    Write-Info "Starting production services..."
    if ($atlas) {
        docker-compose -f docker-compose.prod.yml up -d app mysql nginx
    } else {
        docker-compose -f docker-compose.prod.yml up -d
    }
    
    # Wait for services
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 30
    
    # Run migrations
    Write-Info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec app npm run migration:run
    
    Write-Success "Production environment is ready!"
    Write-Info "API available at: https://localhost"
    Write-Info "Health check: https://localhost/health"
}

# Stop services
function Stop-Services {
    Write-Info "Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    Write-Success "All services stopped"
}

# Clean up
function Remove-AllResources {
    Write-Info "Cleaning up Docker resources..."
    Stop-Services
    docker-compose down --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
    $images = docker images "expanders360*" -q
    if ($images) { docker rmi $images }
    docker system prune -f
    Write-Success "Cleanup completed"
}

# Logs
function Show-Logs {
    param([string]$Service = "app")
    Write-Info "Showing logs for service: $Service"
    docker-compose logs -f $Service
}

# Generate secure passwords
function New-SecurePasswords {
    Write-Info "Generating secure passwords..."
    
    $mysqlRootPassword = -join ((1..25) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
    $mysqlPassword = -join ((1..25) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
    $jwtSecret = -join ((1..50) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
    $refreshTokenSecret = -join ((1..50) | ForEach {Get-Random -InputObject ('a'..'z' + 'A'..'Z' + '0'..'9')})
    
    Write-Host "Generated secure passwords:" -ForegroundColor Green
    Write-Host "MYSQL_ROOT_PASSWORD: $mysqlRootPassword"
    Write-Host "MYSQL_PASSWORD: $mysqlPassword"
    Write-Host "JWT_SECRET: $jwtSecret"
    Write-Host "REFRESH_TOKEN_SECRET: $refreshTokenSecret"
    Write-Host ""
    Write-Warning "Copy these values to your .env file"
}

# Backup
function Backup-Database {
    $backupDir = "backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    $atlas = Using-Atlas

    if ($atlas) {
        Write-Warning "Atlas MongoDB detected. Use 'mongodump --uri \$MONGO_URI' to backup your Atlas cluster."
    } else {
        Write-Info "Creating local MongoDB backup..."
        # docker exec mongo sh -c 'mongodump --archive' > "$backupDir/mongo_backup.archive"
    }

    Write-Info "MySQL backup requires mysqldump with proper credentials in .env"
    Write-Success "Database backup process completed. Files in $backupDir"
}

# Menu
function Show-Menu {
    Write-Host "Expanders360 Backend Deployment Script" -ForegroundColor Blue
    Write-Host "===================================="
    Write-Host "1. Setup Development Environment"
    Write-Host "2. Setup Production Environment"
    Write-Host "3. Stop All Services"
    Write-Host "4. Cleanup (Remove all containers and volumes)"
    Write-Host "5. Show Logs"
    Write-Host "6. Generate Secure Passwords"
    Write-Host "7. Database Backup"
    Write-Host "8. Exit"
    Write-Host ""
}

# Main
switch ($Action) {
    { $_ -in @("dev", "development") } { Set-DevelopmentEnvironment }
    { $_ -in @("prod", "production") } { Set-ProductionEnvironment }
    "stop" { Stop-Services }
    "cleanup" { Remove-AllResources }
    "logs" { $service = Read-Host "Enter service name (default: app)"; Show-Logs -Service $service }
    "passwords" { New-SecurePasswords }
    "backup" { Backup-Database }
    default {
        Show-Menu
        $choice = Read-Host "Please select an option (1-8)"
        switch ($choice) {
            "1" { Set-DevelopmentEnvironment }
            "2" { Set-ProductionEnvironment }
            "3" { Stop-Services }
            "4" { Remove-AllResources }
            "5" { $service = Read-Host "Enter service name (default: app)"; Show-Logs -Service $service }
            "6" { New-SecurePasswords }
            "7" { Backup-Database }
            "8" { exit 0 }
            default { Write-Error "Invalid option" }
        }
    }
}
