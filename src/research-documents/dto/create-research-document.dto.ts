import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateResearchDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;
}
