#!/bin/bash

# Setup script to create .env file from template
# This script helps users set up their environment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env already exists
if [ -f ".env" ]; then
    log_warning ".env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled."
        exit 0
    fi
fi

log_info "Setting up .env file from template..."

# Copy from example
cp env.example .env

# Generate secure passwords
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
MYSQL_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# Update .env with generated values
sed -i.bak "s/your_mysql_root_password_here/$MYSQL_ROOT_PASSWORD/g" .env
sed -i.bak "s/your_mysql_password_here/$MYSQL_PASSWORD/g" .env
sed -i.bak "s/your_jwt_secret_here/$JWT_SECRET/g" .env
sed -i.bak "s/your_refresh_token_secret_here/$REFRESH_TOKEN_SECRET/g" .env

# Remove backup file
rm .env.bak

log_success ".env file created successfully!"
log_warning "IMPORTANT: Please update the following values in .env:"
echo "  - MONGO_URI: Replace with your MongoDB Atlas connection string"
echo "  - SMTP_USER and SMTP_PASS: Configure your email service"
echo "  - ADMIN_EMAIL: Set your admin email address"
echo ""
log_info "You can now run: ./deploy.sh dev"
