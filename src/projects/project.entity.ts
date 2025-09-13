import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Client } from '../clients/client.entity';
import { ProjectService } from './project-service.entity';
import { Match } from '../matches/match.entity';

export enum ProjectStatus {
  Draft = 'draft',
  Active = 'active',
  OnHold = 'on_hold',
  Completed = 'completed',
  Archived = 'archived',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'client_id', type: 'bigint' })
  clientId: number;

  @Column({ type: 'char', length: 2 })
  country: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.Draft })
  status: ProjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, client => client.projects)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => ProjectService, projectService => projectService.project)
  projectServices: ProjectService[];

  @OneToMany(() => Match, match => match.project)
  matches: Match[];
}
