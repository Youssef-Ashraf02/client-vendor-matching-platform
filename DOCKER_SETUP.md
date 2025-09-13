# Docker Setup Guide for Expanders360 Backend

This guide will help you set up and run the Expanders360 backend application using Docker with MySQL and MongoDB containers.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

### Installation Links:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd expanders360/backend
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### 3. Start the Application

```bash
# Start all services (MySQL, MongoDB, Redis, and App)
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 4. Verify Installation

```bash
# Check if all containers are running
docker-compose ps

# Test the API endpoint
curl http://localhost:3000/health
```

## 🔧 Detailed Setup Instructions

### Step 1: Environment Configuration

1. **Copy the environment file:**

   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your specific configuration:

   **Required Changes:**

   ```env
   # Generate secure passwords
   MYSQL_PASSWORD=your_secure_mysql_password
   MYSQL_ROOT_PASSWORD=your_secure_root_password
   MONGO_PASSWORD=your_secure_mongo_password
   MONGO_ROOT_PASSWORD=your_secure_mongo_root_password
   JWT_SECRET=your_very_secure_jwt_secret_key_here_minimum_32_characters

   # Update email configuration
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   ADMIN_EMAIL=your_admin_email@domain.com
   ```

3. **Generate secure passwords** (recommended):
   ```bash
   # Generate random passwords
   openssl rand -base64 32  # Use this for passwords
   openssl rand -base64 64  # Use this for JWT secret
   ```

### Step 2: Database Setup

The Docker setup includes:

- **MySQL 8.0**: For relational data (projects, vendors, matches)
- **MongoDB 7.0**: For research documents
- **Redis 7**: For caching and session management

**Database Initialization:**

- MySQL: Tables are created automatically via TypeORM migrations
- MongoDB: Initialized with proper indexes for research documents
- Redis: Ready to use for caching

### Step 3: Running the Application

#### Development Mode

```bash
# Start with development configuration
NODE_ENV=development docker-compose up -d

# View real-time logs
docker-compose logs -f app
```

#### Production Mode

```bash
# Start with production configuration
NODE_ENV=production docker-compose up -d

# With Nginx reverse proxy
docker-compose --profile production up -d
```

### Step 4: Database Migrations

After starting the containers, run database migrations:

```bash
# Run TypeORM migrations
docker-compose exec app npm run migration:run

# Seed the database (optional)
docker-compose exec app npm run seed
```

## 📊 Service Details

### Available Services

| Service     | Port   | Description                |
| ----------- | ------ | -------------------------- |
| **App**     | 3000   | NestJS Backend API         |
| **MySQL**   | 3306   | Primary database           |
| **MongoDB** | 27017  | Research documents         |
| **Redis**   | 6379   | Caching layer              |
| **Nginx**   | 80/443 | Reverse proxy (production) |

### Health Checks

All services include health checks. Monitor them with:

```bash
# Check service health
docker-compose ps

# View health check logs
docker-compose logs mysql
docker-compose logs mongodb
docker-compose logs redis
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts

```bash
# Check if ports are already in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :3306
netstat -tulpn | grep :27017

# Change ports in .env file if needed
PORT=3001
MYSQL_PORT=3307
MONGO_PORT=27018
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker-compose logs mysql
docker-compose logs mongodb

# Restart database services
docker-compose restart mysql mongodb
```

#### 3. Permission Issues

```bash
# Fix uploads directory permissions
sudo chown -R $USER:$USER uploads/
chmod -R 755 uploads/
```

#### 4. Memory Issues

```bash
# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory
# Recommended: 4GB minimum
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs mysql
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f app

# Execute commands in running container
docker-compose exec app bash
docker-compose exec mysql mysql -u root -p
docker-compose exec mongodb mongosh
```

## 🛠️ Development Workflow

### Local Development with Docker

1. **Start databases only:**

   ```bash
   docker-compose up -d mysql mongodb redis
   ```

2. **Run app locally:**

   ```bash
   npm install
   npm run start:dev
   ```

3. **Update .env for local development:**
   ```env
   MYSQL_HOST=localhost
   MONGO_URI=mongodb://localhost:27017/expanders360_research
   ```

### Hot Reload Development

```bash
# Start in development mode with hot reload
NODE_ENV=development docker-compose up -d

# The app will automatically restart on code changes
```

## 🚀 Production Deployment

### Production Configuration

1. **Update .env for production:**

   ```env
   NODE_ENV=production
   MYSQL_HOST=your-production-mysql-host
   MONGO_URI=mongodb://your-production-mongo-host:27017/expanders360_research
   JWT_SECRET=your-super-secure-production-jwt-secret
   ```

2. **Use production compose file:**

   ```bash
   docker-compose --profile production up -d
   ```

3. **Set up SSL certificates:**
   ```bash
   mkdir nginx/ssl
   # Place your SSL certificates in nginx/ssl/
   ```

### Scaling

```bash
# Scale the app service
docker-compose up -d --scale app=3

# Use load balancer for multiple instances
```

## 📁 File Structure

```
backend/
├── Dockerfile                 # App container definition
├── docker-compose.yml        # Multi-service orchestration
├── .dockerignore             # Docker build context exclusions
├── env.example               # Environment variables template
├── database/
│   ├── init/                 # MySQL initialization scripts
│   └── mongo-init/           # MongoDB initialization scripts
├── uploads/                  # File upload directory (volume)
└── nginx/                    # Nginx configuration (production)
```

## 🔐 Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable SSL/TLS** in production
4. **Restrict database access** to application only
5. **Regular security updates** for base images

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment configuration
3. Ensure all prerequisites are installed
4. Check Docker and Docker Compose versions

## 🎯 Next Steps

After successful setup:

1. **Test the API endpoints**
2. **Create your first user account**
3. **Upload research documents**
4. **Set up project-vendor matches**
5. **Configure email notifications**

Your Expanders360 backend is now ready to use! 🎉
