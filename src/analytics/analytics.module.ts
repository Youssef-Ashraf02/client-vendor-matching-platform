import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { VendorsModule } from '../vendors/vendors.module';
import { ProjectsModule } from '../projects/projects.module';
import { ResearchDocumentsModule } from '../research-documents/research-documents.module';

@Module({
  imports: [
    VendorsModule,
    ProjectsModule,
    ResearchDocumentsModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
