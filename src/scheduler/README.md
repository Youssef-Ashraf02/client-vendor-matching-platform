# Scheduler Module

This module provides automated scheduled jobs for the Expanders360 platform, including daily match refresh and SLA monitoring.

## Features

- **Daily Match Refresh**: Automatically refreshes matches for all active projects
- **SLA Monitoring**: Monitors vendor response times and flags expired SLAs
- **Weekly Statistics**: Generates weekly match performance reports
- **Email Notifications**: Sends alerts for SLA violations and system summaries
- **Manual Triggers**: Admin endpoints to manually trigger scheduled jobs

## Scheduled Jobs

### 1. Daily Match Refresh

- **Schedule**: Every day at 6:00 AM UTC
- **Purpose**: Refreshes matches for all active projects
- **Features**:
  - Processes all projects with `status = 'active'`
  - Rebuilds matches using the existing matching algorithm
  - Sends notifications for new matches
  - Provides detailed logging and error handling
  - Sends summary email if errors occur

### 2. SLA Monitoring

- **Schedule**: Every day at 8:00 AM UTC
- **Purpose**: Monitors vendor response times and flags expired SLAs
- **Features**:
  - Checks all vendors with recent matches
  - Calculates SLA deadlines based on match creation time
  - Identifies vendors who have exceeded their response SLA
  - Sends immediate alerts to administrators
  - Tracks hours overdue for each violation

### 3. Weekly Statistics

- **Schedule**: Every Monday at 9:00 AM UTC
- **Purpose**: Generates comprehensive weekly performance reports
- **Features**:
  - Total matches created in the past week
  - Average match scores
  - Number of unique projects and vendors
  - Top 10 performing vendors by average score
  - Sends formatted report to administrators

## API Endpoints

### Manual Triggers (Admin Only)

- `POST /scheduler/refresh-matches` - Trigger match refresh for all active projects
- `POST /scheduler/refresh-matches/:projectId` - Trigger match refresh for specific project
- `POST /scheduler/monitor-sla` - Trigger SLA monitoring manually

### Authentication

- All endpoints require JWT authentication
- Admin endpoints require `Admin` role
- Project-specific endpoints allow both `Admin` and `Client` roles

## Configuration

### Environment Variables

- `ADMIN_EMAIL` - Email address for system notifications (defaults to admin@expanders360.com)
- `SMTP_*` - Email configuration for notifications

### Cron Schedule Configuration

The schedules can be customized by modifying the cron expressions in `scheduler.service.ts`:

```typescript
// Daily match refresh at 6:00 AM UTC
@Cron('0 6 * * *')

// SLA monitoring at 8:00 AM UTC
@Cron('0 8 * * *')

// Weekly statistics on Monday at 9:00 AM UTC
@Cron('0 9 * * 1')
```

## Email Notifications

### Match Refresh Summary

Sent when errors occur during daily match refresh:

- Total projects processed
- Success/failure counts
- Instructions to check logs

### SLA Expiration Alerts

Sent immediately when vendors exceed their SLA:

- Vendor details and ID
- SLA hours configured
- Hours overdue
- Related project information
- Match creation timestamp

### Weekly Reports

Comprehensive performance summary including:

- Match statistics for the week
- Top performing vendors
- System health indicators

## Error Handling

- All scheduled jobs include comprehensive error handling
- Failed operations are logged with full stack traces
- Email notifications are sent for critical failures
- Jobs continue processing even if individual items fail
- Rate limiting between operations to prevent system overload

## Monitoring & Logging

The scheduler provides detailed logging for all operations:

```
🔄 Starting daily match refresh for active projects...
📊 Found 15 active projects to process
🔄 Refreshing matches for project 123
✅ Successfully refreshed matches for project 123
🎯 Daily match refresh completed: 15 successful, 0 failed out of 15 projects
```

## Usage Examples

### Manual Match Refresh

```bash
# Refresh all active projects
curl -X POST http://localhost:3000/scheduler/refresh-matches \
  -H "Authorization: Bearer <admin-jwt-token>"

# Refresh specific project
curl -X POST http://localhost:3000/scheduler/refresh-matches/123 \
  -H "Authorization: Bearer <jwt-token>"
```

### Manual SLA Monitoring

```bash
curl -X POST http://localhost:3000/scheduler/monitor-sla \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## Dependencies

- `@nestjs/schedule` - NestJS scheduling framework
- `@nestjs/typeorm` - Database operations
- `nodemailer` - Email notifications
- Existing services: `MatchesService`, `MailService`

## Integration

The scheduler integrates with:

- **Matches Module**: For rebuilding project-vendor matches
- **Notifications Module**: For sending email alerts
- **Projects/Vendors**: For data retrieval and SLA calculations
- **Database**: MySQL for relational data, MongoDB for research documents

## Performance Considerations

- Jobs include delays between operations to prevent system overload
- Batch processing for large datasets
- Efficient database queries with proper indexing
- Email notifications are asynchronous and non-blocking
- Comprehensive error handling prevents job failures
