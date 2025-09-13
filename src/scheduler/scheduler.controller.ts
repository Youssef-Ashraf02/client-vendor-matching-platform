import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  /**
   * Manually trigger match refresh for all active projects
   */
  @Post('refresh-matches')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  async refreshMatches() {
    await this.schedulerService.triggerMatchRefresh();
    return { message: 'Match refresh triggered successfully' };
  }

  /**
   * Manually trigger match refresh for a specific project
   */
  @Post('refresh-matches/:projectId')
  @Roles(UserRole.Admin, UserRole.Client)
  @HttpCode(HttpStatus.OK)
  async refreshMatchesForProject(@Param('projectId', ParseIntPipe) projectId: number) {
    await this.schedulerService.triggerMatchRefresh(projectId);
    return { 
      message: `Match refresh triggered successfully for project ${projectId}`,
      projectId 
    };
  }

  /**
   * Manually trigger SLA monitoring
   */
  @Post('monitor-sla')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  async monitorSla() {
    await this.schedulerService.triggerSlaMonitoring();
    return { message: 'SLA monitoring triggered successfully' };
  }
}
