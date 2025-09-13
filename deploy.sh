#!/bin/bash

# Expanders360 Backend Deployment Script (Atlas-ready version)
# This script helps deploy the application in different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        log_error ".env file not found. Please copy .env.example to .env and configure it."
        exit 1
    fi
    log_success ".env file found"
}

# Setup environment for development
setup_development() {
    log_info "Setting up development environment..."

    check_docker
    check_env_file

    # Create necessary directories
    mkdir -p uploads/research-documents
    mkdir -p nginx/ssl

    # Start services (uses local MySQL, but MongoDB is Atlas now)
    log_info "Starting development services..."
    NODE_ENV=development docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 30

    # Check if app container is running
    if ! docker-compose ps app | grep -q "Up"; then
        log_error "App container is not running. Checking logs..."
        docker-compose logs app
        exit 1
    fi

    # Run migrations
    log_info "Running database migrations..."
    docker-compose exec app npm run migration:run

    # Seed database (optional)
    read -p "Do you want to seed the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec app npm run seed
    fi

    log_success "Development environment is ready!"
    log_info "API available at: http://localhost:3000"
    log_info "Health check: http://localhost:3000/health"
}

# Setup environment for production
setup_production() {
    log_info "Setting up production environment..."

    check_docker
    check_env_file

    # Create necessary directories
    mkdir -p uploads/research-documents
    mkdir -p nginx/ssl

    # Check for SSL certificates
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        log_warning "SSL certificates not found. Generating self-signed certificates for testing..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    fi

    # Start services
    log_info "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 30

    # Run migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec app npm run migration:run

    log_success "Production environment is ready!"
    log_info "API available at: https://localhost"
    log_info "Health check: https://localhost/health"
}

# Stop services
stop_services() {
    log_info "Stopping all services..."

    # Stop development services
    docker-compose down

    # Stop production services
    docker-compose -f docker-compose.prod.yml down

    log_success "All services stopped"
}

# Clean up (remove containers, volumes, images)
cleanup() {
    log_info "Cleaning up Docker resources..."

    stop_services

    # Remove containers
    docker-compose down --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans

    # Remove images
    docker rmi $(docker images "expanders360*" -q) 2>/dev/null || true

    # Clean up unused resources
    docker system prune -f

    log_success "Cleanup completed"
}

# Show logs
show_logs() {
    local service=${1:-app}
    log_info "Showing logs for service: $service"
    docker-compose logs -f "$service"
}

# Database backup (MySQL only, since MongoDB is Atlas)
backup_database() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    log_info "Creating database backup in $backup_dir..."

    # Backup MySQL
    docker-compose exec mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DB" > "$backup_dir/mysql_backup.sql"

    log_success "Database backup completed in $backup_dir"
    log_info "ℹ️ For MongoDB Atlas: use 'mongodump --uri=\"\$MONGO_URI\"' locally or in CI/CD."
}

# Main menu
show_menu() {
    echo -e "${BLUE}Expanders360 Backend Deployment Script${NC}"
    echo "=================================="
    echo "1. Setup Development Environment"
    echo "2. Setup Production Environment"
    echo "3. Stop All Services"
    echo "4. Cleanup (Remove all containers and volumes)"
    echo "5. Show Logs"
    echo "6. Database Backup (MySQL only)"
    echo "7. Exit"
    echo ""
}

# Main script
main() {
    case "${1:-menu}" in
        "dev"|"development")
            setup_development
            ;;
        "prod"|"production")
            setup_production
            ;;
        "stop")
            stop_services
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            show_logs "$2"
            ;;
        "backup")
            backup_database
            ;;
        "menu"|*)
            show_menu
            read -p "Please select an option (1-7): " choice
            case $choice in
                1) setup_development ;;
                2) setup_production ;;
                3) stop_services ;;
                4) cleanup ;;
                5) 
                    read -p "Enter service name (default: app): " service
                    show_logs "${service:-app}"
                    ;;
                6) backup_database ;;
                7) exit 0 ;;
                *) log_error "Invalid option" ;;
            esac
            ;;
    esac
}

# Run main function
main "$@"
