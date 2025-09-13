import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendors.dto';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}