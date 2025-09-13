import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Service } from '../services/service.entity';

@Entity('project_services')
export class ProjectService {
  @PrimaryColumn({ name: 'project_id', type: 'bigint' })
  projectId: number;

  @PrimaryColumn({ name: 'service_id', type: 'bigint' })
  serviceId: number;

  @ManyToOne(() => Project, project => project.projectServices)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Service, service => service.projectServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
