import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectService } from '../projects/project-service.entity';
import { VendorService } from '../vendors/vendor-service.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @OneToMany(() => ProjectService, projectService => projectService.service)
  projectServices: ProjectService[];

  @OneToMany(() => VendorService, vendorService => vendorService.service)
  vendorServices: VendorService[];
}
