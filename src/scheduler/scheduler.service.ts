import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/project.entity';
import { Vendor } from '../vendors/vendor.entity';
import { Match } from '../matches/match.entity';
import { MatchesService } from '../matches/matches.service';
import { MailService } from '../notifications/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(Vendor)
    private readonly vendorsRepo: Repository<Vendor>,
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    private readonly matchesService: MatchesService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Daily job to refresh matches for active projects
   * Runs every day at 6:00 AM
   */
  @Cron('0 6 * * *', {
    name: 'refresh-matches-daily',
    timeZone: 'UTC',
  })
  async refreshMatchesDaily() {
    this.logger.log('🔄 Starting daily match refresh for active projects...');

    try {
      // Get all active projects
      const activeProjects = await this.projectsRepo.find({
        where: { status: ProjectStatus.Active },
        select: ['id', 'country', 'clientId'],
      });

      this.logger.log(`📊 Found ${activeProjects.length} active projects to process`);

      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const project of activeProjects) {
        try {
          this.logger.log(`🔄 Refreshing matches for project ${project.id}`);
          
          await this.matchesService.rebuildMatchesForProject(project.id);
          
          successCount++;
          this.logger.log(`✅ Successfully refreshed matches for project ${project.id}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `❌ Failed to refresh matches for project ${project.id}: ${error.message}`,
            error.stack,
          );
        }
        
        processedCount++;
        
        // Add a small delay between projects to avoid overwhelming the system
        if (processedCount < activeProjects.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(
        `🎯 Daily match refresh completed: ${successCount} successful, ${errorCount} failed out of ${processedCount} projects`,
      );

      // Send summary email to admin if there were errors
      if (errorCount > 0) {
        await this.sendMatchRefreshSummary(activeProjects.length, successCount, errorCount);
      }

    } catch (error) {
      this.logger.error('💥 Daily match refresh job failed:', error.stack);
    }
  }

  /**
   * Daily job to flag vendors with expired SLAs
   * Runs every day at 8:00 AM
   */
  @Cron('0 8 * * *', {
    name: 'monitor-sla-expiration',
    timeZone: 'UTC',
  })
  async monitorSlaExpiration() {
    this.logger.log('🚨 Starting SLA expiration monitoring...');

    try {
      // Get vendors with matches that might have SLA issues
      const vendorsWithMatches = await this.vendorsRepo
        .createQueryBuilder('vendor')
        .innerJoin('vendor.matches', 'match')
        .innerJoin('match.project', 'project')
        .select([
          'vendor.id',
          'vendor.name',
          'vendor.response_sla_hours',
          'match.id',
          'match.createdAt',
          'project.id',
        ])
        .where('match.createdAt IS NOT NULL')
        .getMany();

      this.logger.log(`📊 Checking SLA status for ${vendorsWithMatches.length} vendors with matches`);

      const expiredSlaVendors: Array<{
        vendor: Vendor;
        match: Match;
        slaDeadline: Date;
        hoursOverdue: number;
      }> = [];
      const currentTime = new Date();

      for (const vendor of vendorsWithMatches) {
        // Get the most recent match for this vendor
        const recentMatch = await this.matchesRepo
          .createQueryBuilder('match')
          .where('match.vendorId = :vendorId', { vendorId: vendor.id })
          .orderBy('match.createdAt', 'DESC')
          .getOne();

        if (recentMatch) {
          const slaDeadline = new Date(recentMatch.createdAt);
          slaDeadline.setHours(slaDeadline.getHours() + vendor.responseSlaHours);

          if (currentTime > slaDeadline) {
            expiredSlaVendors.push({
              vendor,
              match: recentMatch,
              slaDeadline,
              hoursOverdue: Math.floor((currentTime.getTime() - slaDeadline.getTime()) / (1000 * 60 * 60)),
            });
          }
        }
      }

      this.logger.log(`🚨 Found ${expiredSlaVendors.length} vendors with expired SLAs`);

      if (expiredSlaVendors.length > 0) {
        await this.sendSlaExpirationAlerts(expiredSlaVendors);
      } else {
        this.logger.log('✅ No vendors with expired SLAs found');
      }

    } catch (error) {
      this.logger.error('💥 SLA monitoring job failed:', error.stack);
    }
  }

  /**
   * Weekly job to generate match statistics
   * Runs every Monday at 9:00 AM
   */
  @Cron('0 9 * * 1', {
    name: 'weekly-match-statistics',
    timeZone: 'UTC',
  })
  async generateWeeklyStatistics() {
    this.logger.log('📈 Generating weekly match statistics...');

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get match statistics for the past week
      const weeklyStats = await this.matchesRepo
        .createQueryBuilder('match')
        .select([
          'COUNT(match.id) as totalMatches',
          'AVG(match.score) as averageScore',
          'COUNT(DISTINCT match.projectId) as uniqueProjects',
          'COUNT(DISTINCT match.vendorId) as uniqueVendors',
        ])
        .where('match.createdAt >= :date', { date: oneWeekAgo })
        .getRawOne();

      // Get top performing vendors
      const topVendors = await this.vendorsRepo
        .createQueryBuilder('vendor')
        .innerJoin('vendor.matches', 'match')
        .select([
          'vendor.id',
          'vendor.name',
          'AVG(match.score) as averageScore',
          'COUNT(match.id) as matchCount',
        ])
        .where('match.createdAt >= :date', { date: oneWeekAgo })
        .groupBy('vendor.id, vendor.name')
        .orderBy('averageScore', 'DESC')
        .limit(10)
        .getRawMany();

      this.logger.log('📊 Weekly statistics generated successfully');
      this.logger.log(`📈 Total matches: ${weeklyStats.totalMatches}`);
      this.logger.log(`📈 Average score: ${parseFloat(weeklyStats.averageScore).toFixed(2)}`);
      this.logger.log(`📈 Unique projects: ${weeklyStats.uniqueProjects}`);
      this.logger.log(`📈 Unique vendors: ${weeklyStats.uniqueVendors}`);

      // Send weekly report to admin
      await this.sendWeeklyReport(weeklyStats, topVendors);

    } catch (error) {
      this.logger.error('💥 Weekly statistics generation failed:', error.stack);
    }
  }

  /**
   * Send match refresh summary email to admin
   */
  private async sendMatchRefreshSummary(
    totalProjects: number,
    successCount: number,
    errorCount: number,
  ) {
    try {
      const subject = 'Daily Match Refresh Summary - Errors Detected';
      const html = `
        <h2>Daily Match Refresh Summary</h2>
        <p><strong>Total Projects Processed:</strong> ${totalProjects}</p>
        <p><strong>Successful:</strong> ${successCount}</p>
        <p><strong>Errors:</strong> ${errorCount}</p>
        <p><em>Please check the logs for detailed error information.</em></p>
      `;

      // You can configure admin email in environment variables
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@expanders360.com';
      
      await this.mailService.sendEmail(adminEmail, subject, html);
      this.logger.log(`📧 Match refresh summary sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error('Failed to send match refresh summary:', error.message);
    }
  }

  /**
   * Send SLA expiration alerts
   */
  private async sendSlaExpirationAlerts(expiredVendors: Array<{
    vendor: Vendor;
    match: Match;
    slaDeadline: Date;
    hoursOverdue: number;
  }>) {
    try {
      const subject = 'SLA Expiration Alert - Immediate Action Required';
      
      let html = `
        <h2>🚨 SLA Expiration Alert</h2>
        <p>The following vendors have exceeded their response SLA:</p>
        <ul>
      `;

      for (const item of expiredVendors) {
        html += `
          <li>
            <strong>Vendor:</strong> ${item.vendor.name} (ID: ${item.vendor.id})<br>
            <strong>SLA Hours:</strong> ${item.vendor.responseSlaHours}<br>
            <strong>Hours Overdue:</strong> ${item.hoursOverdue}<br>
            <strong>Project:</strong> ${item.match.projectId}<br>
            <strong>Match Created:</strong> ${item.match.createdAt}
          </li>
        `;
      }

      html += `
        </ul>
        <p><em>Please follow up with these vendors immediately.</em></p>
      `;

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@expanders360.com';
      
      await this.mailService.sendEmail(adminEmail, subject, html);
      this.logger.log(`📧 SLA expiration alerts sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error('Failed to send SLA expiration alerts:', error.message);
    }
  }

  /**
   * Send weekly report to admin
   */
  private async sendWeeklyReport(weeklyStats: any, topVendors: any[]) {
    try {
      const subject = 'Weekly Match Statistics Report';
      
      let html = `
        <h2>📈 Weekly Match Statistics Report</h2>
        <h3>Summary</h3>
        <ul>
          <li><strong>Total Matches:</strong> ${weeklyStats.totalMatches}</li>
          <li><strong>Average Score:</strong> ${parseFloat(weeklyStats.averageScore).toFixed(2)}</li>
          <li><strong>Unique Projects:</strong> ${weeklyStats.uniqueProjects}</li>
          <li><strong>Unique Vendors:</strong> ${weeklyStats.uniqueVendors}</li>
        </ul>
        
        <h3>Top Performing Vendors</h3>
        <ol>
      `;

      for (const vendor of topVendors) {
        html += `
          <li>
            <strong>${vendor.vendor_name}</strong> - 
            Score: ${parseFloat(vendor.averageScore).toFixed(2)}, 
            Matches: ${vendor.matchCount}
          </li>
        `;
      }

      html += `</ol>`;

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@expanders360.com';
      
      await this.mailService.sendEmail(adminEmail, subject, html);
      this.logger.log(`📧 Weekly report sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error('Failed to send weekly report:', error.message);
    }
  }

  /**
   * Manual trigger for match refresh (for testing or emergency use)
   */
  async triggerMatchRefresh(projectId?: number) {
    this.logger.log(`🔄 Manual match refresh triggered${projectId ? ` for project ${projectId}` : ' for all active projects'}`);
    
    if (projectId) {
      await this.matchesService.rebuildMatchesForProject(projectId);
      this.logger.log(`✅ Manual match refresh completed for project ${projectId}`);
    } else {
      await this.refreshMatchesDaily();
    }
  }

  /**
   * Manual trigger for SLA monitoring (for testing)
   */
  async triggerSlaMonitoring() {
    this.logger.log('🚨 Manual SLA monitoring triggered');
    await this.monitorSlaExpiration();
    this.logger.log('✅ Manual SLA monitoring completed');
  }
}
