import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { MatchesService } from '../matches/matches.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly matchesService: MatchesService,
  ) {}

  // Helper to ensure a client owns a given project
  private async assertOwnershipOrAdmin(req, project) {
    if (req.user.role === UserRole.Admin) return;
    const client = await this.projectsService.getClientByOwnerUserId(req.user.userId);
    if (!client || project.clientId !== client.id) {
      throw new ForbiddenException('Access denied');
    }
  }

  // Both clients and admins can create projects.
  // Clients: backend enforces correct clientId.
  @Post()
  @Roles(UserRole.Admin, UserRole.Client)
  async create(@Body() dto: CreateProjectDto, @Req() req) {
    if (req.user.role === UserRole.Client) {
      const client = await this.projectsService.getClientByOwnerUserId(req.user.userId);
      if (!client) {
        throw new ForbiddenException('Client record not found');
      }
      dto.clientId = client.id; // enforce ownership
    }
    return this.projectsService.create(dto);
  }

  // Admins see all projects, clients see only their own.
  @Get()
  @Roles(UserRole.Admin, UserRole.Client)
  async findAll(@Req() req) {
    if (req.user.role === UserRole.Admin) {
      return this.projectsService.findAll();
    }
    const client = await this.projectsService.getClientByOwnerUserId(req.user.userId);
    if (!client) {
      return [];
    }
    return this.projectsService.findByClientId(client.id);
  }

  // Admins can fetch any project, clients only their own.
  @Get(':id')
  @Roles(UserRole.Admin, UserRole.Client)
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const project = await this.projectsService.findById(id);
    await this.assertOwnershipOrAdmin(req, project);
    return project;
  }

  // Admins can update any project, clients only their own.
  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Client)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req,
  ) {
    const project = await this.projectsService.findById(id);
    await this.assertOwnershipOrAdmin(req, project);
    return this.projectsService.update(id, dto);
  }

  // Admins can delete any project, clients only their own.
  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.Client)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const project = await this.projectsService.findById(id);
    await this.assertOwnershipOrAdmin(req, project);
    return this.projectsService.remove(id);
  }

  // Rebuild vendor matches for a project
  @Post(':id/matches/rebuild')
  @Roles(UserRole.Admin, UserRole.Client)
  async rebuildMatches(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const project = await this.projectsService.findById(id);
    await this.assertOwnershipOrAdmin(req, project);
    return this.matchesService.rebuildMatchesForProject(id);
  }
}
