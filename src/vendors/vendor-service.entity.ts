import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Service } from '../services/service.entity';

@Entity('vendor_services')
export class VendorService {
  @PrimaryColumn({ name: 'vendor_id', type: 'bigint' })
  vendorId: number;

  @PrimaryColumn({ name: 'service_id', type: 'bigint' })
  serviceId: number;

  @ManyToOne(() => Vendor, vendor => vendor.vendorServices)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Service, service => service.vendorServices)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
