import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResearchDocumentsService } from './research-documents.service';
import { CreateResearchDocumentDto } from './dto/create-research-document.dto';
import { UpdateResearchDocumentDto } from './dto/update-research-document.dto';
import { SearchResearchDocumentsDto } from './dto/search-research-documents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { ResearchDocument } from './research-document.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Multer } from 'multer';

@Controller('research-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchDocumentsController {
  constructor(private readonly researchDocumentsService: ResearchDocumentsService) {}

  @Post()
  @Roles(UserRole.Client, UserRole.Admin)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/research-documents',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow common document types
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('File type not allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('data') data: string, // <-- get the JSON as a string
  ): Promise<ResearchDocument> {
    let dto: CreateResearchDocumentDto;
  
    try {
      dto = JSON.parse(data); // parse the JSON string
    } catch (err) {
      throw new BadRequestException('Invalid JSON in data field');
    }
  
    if (file) {
      dto.fileUrl = `/uploads/research-documents/${file.filename}`;
      dto.mimeType = file.mimetype;
      dto.fileSize = file.size;
    }
  
    return this.researchDocumentsService.create(dto);
  }
  @Get()
  @Roles(UserRole.Client, UserRole.Admin)
  async findAll(@Query() searchDto: SearchResearchDocumentsDto) {
    return this.researchDocumentsService.findAll(searchDto);
  }

  @Get('statistics')
  @Roles(UserRole.Client, UserRole.Admin)
  async getStatistics(@Query('projectId', new ParseIntPipe({ optional: true })) projectId?: number) {
    return this.researchDocumentsService.getStatistics(projectId);
  }

  @Get('search')
  @Roles(UserRole.Client, UserRole.Admin)
  async search(@Query() searchDto: SearchResearchDocumentsDto) {
    return this.researchDocumentsService.findAll(searchDto);
  }

  @Get('by-project/:projectId')
  @Roles(UserRole.Client, UserRole.Admin)
  async findByProjectId(@Param('projectId', ParseIntPipe) projectId: number): Promise<ResearchDocument[]> {
    return this.researchDocumentsService.findByProjectId(projectId);
  }

  @Get('by-tags')
  @Roles(UserRole.Client, UserRole.Admin)
  async searchByTags(@Query('tags') tags: string): Promise<ResearchDocument[]> {
    const tagArray = tags.split(',').map(tag => tag.trim());
    return this.researchDocumentsService.searchByTags(tagArray);
  }

  @Get('count/by-project/:projectId')
  @Roles(UserRole.Client, UserRole.Admin)
  async getDocumentsCountByProject(@Param('projectId', ParseIntPipe) projectId: number): Promise<number> {
    return this.researchDocumentsService.getDocumentsCountByProject(projectId);
  }

  @Get('count/by-project-and-country/:projectId')
  @Roles(UserRole.Client, UserRole.Admin)
  async getDocumentsCountByProjectAndCountry(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('country') country?: string,
  ): Promise<number> {
    return this.researchDocumentsService.getDocumentsCountByProjectAndCountry(projectId, country);
  }

  @Get(':id')
  @Roles(UserRole.Client, UserRole.Admin)
  async findOne(@Param('id') id: string): Promise<ResearchDocument> {
    return this.researchDocumentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Client, UserRole.Admin)
  async update(
    @Param('id') id: string,
    @Body() updateResearchDocumentDto: UpdateResearchDocumentDto,
  ): Promise<ResearchDocument> {
    return this.researchDocumentsService.update(id, updateResearchDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.Client, UserRole.Admin)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.researchDocumentsService.remove(id);
    return { message: 'Research document deleted successfully' };
  }
}
