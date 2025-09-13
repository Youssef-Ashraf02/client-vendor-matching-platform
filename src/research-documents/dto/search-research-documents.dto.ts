import { IsString, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchResearchDocumentsDto {
  @IsString()
  @IsOptional()
  searchText?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.split(',') : value)
  tags?: string[];

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  projectId?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
