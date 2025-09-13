import { PartialType } from '@nestjs/mapped-types';
import { CreateResearchDocumentDto } from './create-research-document.dto';

export class UpdateResearchDocumentDto extends PartialType(CreateResearchDocumentDto) {}
