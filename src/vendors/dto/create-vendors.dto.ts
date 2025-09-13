import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsNumber()
  responseSlaHours: number;

  @IsArray()
  @IsString({ each: true })
  countriesSupported: string[];

  @IsArray()
  @IsNumber({}, { each: true })
  servicesOffered: number[];
}