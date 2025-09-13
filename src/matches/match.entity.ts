import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Vendor } from '../vendors/vendor.entity';

@Entity('matches')
@Unique(['projectId', 'vendorId'])
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'project_id', type: 'bigint' })
  projectId: number;

  @Column({ name: 'vendor_id', type: 'bigint' })
  vendorId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.matches)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, vendor => vendor.matches)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
