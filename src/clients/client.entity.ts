import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'contact_email' })
  contactEmail: string;

  @Column({ name: 'owner_user_id', type: 'bigint' })
  ownerUserId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.ownedClients)
  @JoinColumn({ name: 'owner_user_id' })
  ownerUser: User;

  @OneToMany(() => Project, project => project.client)
  projects: Project[];
}
