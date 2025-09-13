import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './vendor.entity';
import { VendorService } from './vendor-service.entity';
import { VendorCountry } from './vendor-country.entity';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, VendorService, VendorCountry])],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [TypeOrmModule, VendorsService], 
})
export class VendorsModule {}
