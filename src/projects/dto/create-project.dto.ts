import { IsNumber, IsString, IsEnum, IsNotEmpty,IsOptional } from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @IsNumber()
  @IsOptional()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  budget: number;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}