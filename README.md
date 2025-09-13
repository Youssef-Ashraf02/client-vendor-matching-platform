# VendorMatch – Client-Vendor Matching Platform (Backend)

A comprehensive NestJS backend application for managing business expansion projects, vendor matching, and research document management. This system facilitates the connection between clients seeking expansion services and qualified vendors across different countries.

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with role-based access control
- **Two user roles**: `client` and `admin`
- **Client permissions**: Manage their own projects and view matches
- **Admin permissions**: Manage vendors, system configurations, and view all data

### 📊 Project & Vendor Management

- **Relational MySQL database** for structured data
- **Client management** with company information
- **Project tracking** with country, services, budget, and status
- **Vendor profiles** with supported countries, services, ratings, and SLA
- **Intelligent matching algorithm** connecting projects with suitable vendors

### 📄 Research Documents (MongoDB)

- **Schema-free document storage** for market reports and research files
- **Full-text search** capabilities across document content
- **Tag-based organization** and project linking
- **File upload support** with metadata tracking

### 🎯 Smart Matching System

- **Automated vendor matching** based on:
  - Country coverage alignment
  - Service overlap requirements
  - Vendor ratings and SLA performance
- **Scoring algorithm**: `services_overlap * 2 + rating + SLA_weight`
- **Idempotent upsert logic** for consistent match updates

### 📈 Analytics & Reporting

- **Cross-database queries** combining MySQL and MongoDB data
- **Top vendor analytics** per country with match scores
- **Research document statistics** linked to expansion projects
- **Performance metrics** and trend analysis

### ⏰ Automated Scheduling

- **Daily match refresh** for active projects
- **SLA monitoring** with vendor performance tracking
- **Email notifications** for new matches and SLA violations
- **Weekly statistics reports** for administrators

### 🐳 Production Ready

- **Docker containerization** with multi-service orchestration
- **MySQL + MongoDB** database setup
- **Nginx reverse proxy** configuration
- **Environment-based configuration** management
- **Health checks** and monitoring

## 🛠 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Databases**:
  - MySQL 8.0 (relational data)
  - MongoDB Atlas (document storage)
- **Authentication**: JWT with Passport
- **ORM**: TypeORM (MySQL) + Mongoose (MongoDB)
- **Scheduling**: NestJS Schedule
- **Email**: Nodemailer with SMTP
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Validation**: Class-validator + Joi

## 📁 Project Structure

```
src/
├── analytics/           # Cross-database analytics and reporting
├── auth/               # JWT authentication and role guards
├── clients/            # Client management (companies)
├── config/             # Configuration and validation schemas
├── database/           # Database setup, migrations, and seeds
├── matches/            # Project-vendor matching logic
├── notifications/      # Email service and notifications
├── projects/           # Project management and services
├── research-documents/ # MongoDB document management
├── scheduler/          # Automated tasks and cron jobs
├── services/           # Shared services and utilities
├── users/              # User management and authentication
└── vendors/            # Vendor profiles and management
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0+ (or use Docker)
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd expanders360-backend
npm install
```

### 2. Environment Configuration

**Option A: Quick Setup (Recommended)**

```bash
# Windows PowerShell
.\setup-env.ps1

# Linux/Mac
./setup-env.sh
```

**Option B: Manual Setup**

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
MYSQL_HOST=mysql
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DB=expanders

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### 3. Database Setup

```bash
# Run migrations
npm run migration:run

# Seed initial data
npm run seed
```

### 4. Development

```bash
# Start with Docker Compose
docker-compose up -d

# Or run locally
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Services Included

- **App**: NestJS application (port 3000)
- **MySQL**: Database server (port 3306)
- **Redis**: Caching and sessions (port 6379)
- **Nginx**: Reverse proxy (ports 80/443)

## 📚 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh JWT token

### Projects

- `GET /projects` - List projects (client: own, admin: all)
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `POST /projects/:id/matches/rebuild` - Rebuild vendor matches

### Vendors

- `GET /vendors` - List vendors
- `POST /vendors` - Create vendor (admin only)
- `GET /vendors/:id` - Get vendor details
- `PUT /vendors/:id` - Update vendor (admin only)

### Research Documents

- `POST /research-documents/upload` - Upload document
- `GET /research-documents` - Search documents
- `GET /research-documents/project/:projectId` - Get project documents

### Analytics

- `GET /analytics/top-vendors` - Top vendors by country with research data

### Matches

- `GET /matches/project/:projectId` - Get project matches
- `GET /matches/vendor/:vendorId` - Get vendor matches

## 🔧 Configuration

### Environment Variables

| Variable      | Description               | Default       |
| ------------- | ------------------------- | ------------- |
| `NODE_ENV`    | Environment mode          | `development` |
| `PORT`        | Application port          | `3000`        |
| `MYSQL_HOST`  | MySQL host                | `mysql`       |
| `MYSQL_PORT`  | MySQL port                | `3306`        |
| `MONGO_URI`   | MongoDB connection string | Required      |
| `JWT_SECRET`  | JWT signing secret        | Required      |
| `SMTP_HOST`   | SMTP server host          | Required      |
| `ADMIN_EMAIL` | Admin notification email  | Required      |

### Database Schema

#### MySQL Tables

- `users` - User accounts and authentication
- `clients` - Company/client information
- `projects` - Expansion projects
- `vendors` - Service provider profiles
- `matches` - Project-vendor matching results
- `project_services` - Services required by projects
- `vendor_services` - Services offered by vendors
- `vendor_countries` - Countries supported by vendors

#### MongoDB Collections

- `researchdocuments` - Market research and project documents

## 📊 Matching Algorithm

The system uses a sophisticated scoring algorithm to match projects with vendors:

```typescript
score = services_overlap * 2 + rating + SLA_weight;
```

**Matching Criteria:**

1. **Country Coverage**: Vendor must support the project's target country
2. **Service Overlap**: At least one service must match between project and vendor
3. **Performance Factors**: Rating and SLA response time influence the score

## ⏰ Scheduled Jobs

- **Daily Match Refresh** (6:00 AM UTC): Updates matches for all active projects
- **SLA Monitoring** (8:00 AM UTC): Flags vendors with expired response times
- **Weekly Statistics** (Monday 9:00 AM UTC): Generates performance reports

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🚀 Deployment

### Cloud Deployment Options

#### Railway

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

#### Render

1. Create new Web Service
2. Connect repository
3. Configure build and start commands
4. Set environment variables

#### AWS Free Tier

1. Use AWS RDS for MySQL
2. MongoDB Atlas for document storage
3. EC2 instance for application
4. Configure security groups and load balancer

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URLs
- [ ] Set strong JWT secrets
- [ ] Configure SMTP for email notifications
- [ ] Set up SSL certificates
- [ ] Configure CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Error: Bind for 0.0.0.0:3307 failed: port is already allocated
# Solution: Change MySQL port in .env file
MYSQL_PORT=3308  # or any other available port
```

#### 2. App Container Not Starting

```bash
# Check container logs
docker-compose logs app

# Check if all required environment variables are set
docker-compose config

# Restart services
docker-compose down && docker-compose up -d
```

#### 3. Database Connection Issues

```bash
# Check MySQL container status
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Test database connection
docker-compose exec app npm run migration:run
```

#### 4. Missing Environment Variables

```bash
# Generate secure passwords
.\deploy.ps1 passwords  # Windows
./deploy.sh passwords   # Linux/Mac

# Or use the setup script
.\setup-env.ps1  # Windows
./setup-env.sh   # Linux/Mac
```

#### 5. MongoDB Atlas Connection

- Ensure your MongoDB Atlas cluster allows connections from your IP
- Check the connection string format in `.env`
- Verify network access settings in MongoDB Atlas dashboard

### Debug Commands

```bash
# View all container status
docker-compose ps

# View logs for specific service
docker-compose logs -f app

# Execute commands in running container
docker-compose exec app bash

# Check environment variables
docker-compose exec app env
```

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` (when running)

---

**Built with ❤️ using NestJS, TypeScript, MySQL, and MongoDB**
