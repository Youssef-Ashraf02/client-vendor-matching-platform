import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';

@Entity('vendor_countries')
export class VendorCountry {
  @PrimaryColumn({ name: 'vendor_id', type: 'bigint' })
  vendorId: number;

  @PrimaryColumn({ type: 'char', length: 2 })
  country: string;

  @ManyToOne(() => Vendor, vendor => vendor.vendorCountries)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
