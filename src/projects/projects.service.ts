import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Client } from '../clients/client.entity';
import { ProjectService } from './project-service.entity';
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectRepository(ProjectService)
    private readonly projectServicesRepo: Repository<ProjectService>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}
   
  async create(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepo.create(dto);
    return this.projectsRepo.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepo.find();
  }
  async getClientByOwnerUserId(ownerUserId: number): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { ownerUserId } });
  }

  async findByClientId(clientId: number): Promise<Project[]> {
    return this.projectsRepo.find({ where: { clientId } });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectsRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    Object.assign(project, dto);
    return this.projectsRepo.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findById(id);
    await this.projectsRepo.remove(project);
  }

  async getProjectIdsByCountry(country: string): Promise<number[]> {
    const projects = await this.projectsRepo.find({
      where: { country },
      select: ['id'],
    });
    return projects.map(p => p.id);
  }
}


