import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { CreateVendorDto } from './dto/create-vendors.dto';
import { UpdateVendorDto } from './dto/update-vendors.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorsRepo: Repository<Vendor>,
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorsRepo.create(dto);
    return this.vendorsRepo.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorsRepo.find();
  }

  async findById(id: number): Promise<Vendor> {
    const vendor = await this.vendorsRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: number, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findById(id);
    Object.assign(vendor, dto);
    return this.vendorsRepo.save(vendor);
  }

  async remove(id: number): Promise<void> {
    const vendor = await this.findById(id);
    await this.vendorsRepo.remove(vendor);
  }
  async getTopVendorsByCountry(): Promise<
  { country: string; vendorId: number; vendorName: string; avgScore: number }[]
> {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  return this.vendorsRepo
    .createQueryBuilder('vendor')
    .innerJoin('vendor.vendorCountries', 'vc')   // vendor_countries
    .innerJoin('vendor.matches', 'm')            // matches
    .select('vc.country', 'country')
    .addSelect('vendor.id', 'vendorId')
    .addSelect('vendor.name', 'vendorName')
    .addSelect('AVG(m.score)', 'avgScore')
    .where('m.createdAt >= :date', { date: last30Days })
    .groupBy('vc.country, vendor.id, vendor.name')
    .orderBy('vc.country')
    .addOrderBy('AVG(m.score)', 'DESC')
    .getRawMany();
}

}