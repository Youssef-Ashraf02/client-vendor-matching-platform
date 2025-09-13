import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project-service.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MatchesModule } from '../matches/matches.module';
import { Client } from '../clients/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectService,Client]), MatchesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [TypeOrmModule, ProjectsService],
})
export class ProjectsModule {}
