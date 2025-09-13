import { Injectable } from '@nestjs/common';
import { VendorsService } from '../vendors/vendors.service';
import { ProjectsService } from '../projects/projects.service';
import { ResearchDocumentsService } from '../research-documents/research-documents.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly researchDocsService: ResearchDocumentsService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getTopVendorsWithResearchData() {
    const vendors = await this.vendorsService.getTopVendorsByCountry();
  
    const vendorsByCountry: Record<string, any[]> = {};
    for (const v of vendors) {
      if (!vendorsByCountry[v.country]) vendorsByCountry[v.country] = [];
      vendorsByCountry[v.country].push(v);
    }
  
    const result = await Promise.all(
      Object.entries(vendorsByCountry).map(async ([country, vendors]) => {
        const top3 = vendors.slice(0, 3);
  
        //  Step 1: get project IDs for this country (from MySQL)
        const projectIds = await this.projectsService.getProjectIdsByCountry(country);
  
        //  Step 2: count research docs linked to those projects (from MongoDB)
        const researchDocCount = await this.researchDocsService.countByProjectIds(projectIds);
  
        return {
          country,
          researchDocCount,
          topVendors: top3.map(v => ({
            vendorId: v.vendorId,
            vendorName: v.vendorName,
            avgScore: Number(v.avgScore),
          })),
        };
      }),
    );
  
    return result;
  }
  
}
