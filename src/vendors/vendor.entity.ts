import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { VendorService } from './vendor-service.entity';
import { VendorCountry } from './vendor-country.entity';
import { Match } from '../matches/match.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ name: 'response_sla_hours' })
  responseSlaHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => VendorService, vendorService => vendorService.vendor)
  vendorServices: VendorService[];

  @OneToMany(() => VendorCountry, vendorCountry => vendorCountry.vendor)
  vendorCountries: VendorCountry[];

  @OneToMany(() => Match, match => match.vendor)
  matches: Match[];
}
