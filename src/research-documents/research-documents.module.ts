import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchDocumentsService } from './research-documents.service';
import { ResearchDocumentsController } from './research-documents.controller';
import { ResearchDocumentModel, ResearchDocumentSchema } from './research-document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResearchDocumentModel.name, schema: ResearchDocumentSchema },
    ]),
  ],
  controllers: [ResearchDocumentsController],
  providers: [ResearchDocumentsService],
  exports: [ResearchDocumentsService],
})
export class ResearchDocumentsModule {}
