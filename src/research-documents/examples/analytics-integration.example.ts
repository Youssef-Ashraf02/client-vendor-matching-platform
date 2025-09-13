/**
 * Example of how to integrate Research Documents with Analytics
 * This shows cross-DB queries between MySQL (projects/vendors) and MongoDB (research documents)
 */

import { Injectable } from '@nestjs/common';
import { ResearchDocumentsService } from '../research-documents.service';
// import { ProjectsService } from '../../projects/projects.service'; // MySQL service
// import { VendorsService } from '../../vendors/vendors.service'; // MySQL service

@Injectable()
export class AnalyticsIntegrationExample {
  constructor(
    private readonly researchDocumentsService: ResearchDocumentsService,
    // private readonly projectsService: ProjectsService,
    // private readonly vendorsService: VendorsService,
  ) {}

  /**
   * Example: Get top vendors with research document counts
   * This would be used in the /analytics/top-vendors endpoint
   */
  async getTopVendorsWithResearchData() {
    // 1. Get top vendors from MySQL (this would come from your existing vendors service)
    // const topVendors = await this.vendorsService.getTopVendorsByCountry();

    // 2. For each vendor's supported countries, get research document counts from MongoDB
    const mockVendors = [
      { id: 1, name: 'Vendor A', countriesSupported: ['USA', 'Canada'] },
      { id: 2, name: 'Vendor B', countriesSupported: ['USA', 'Mexico'] },
    ];

    const vendorsWithResearchData = await Promise.all(
      mockVendors.map(async (vendor) => {
        const researchData = await Promise.all(
          vendor.countriesSupported.map(async (country) => {
            // Get document count for projects in this country
            const documentCount = await this.researchDocumentsService
              .getDocumentsCountByProjectAndCountry(vendor.id, country);
            
            return {
              country,
              researchDocumentCount: documentCount,
            };
          })
        );

        return {
          ...vendor,
          researchData,
        };
      })
    );

    return vendorsWithResearchData;
  }

  /**
   * Example: Get project expansion insights
   */
  async getProjectExpansionInsights(projectId: number) {
    // Get all research documents for the project
    const documents = await this.researchDocumentsService.findByProjectId(projectId);
    
    // Get statistics
    const stats = await this.researchDocumentsService.getStatistics(projectId);
    
    // Analyze document tags to understand expansion focus areas
    const tagAnalysis = stats.mostUsedTags.map(tag => ({
      tag: tag.tag,
      frequency: tag.count,
      percentage: (tag.count / stats.totalDocuments) * 100,
    }));

    return {
      projectId,
      totalDocuments: stats.totalDocuments,
      tagAnalysis,
      recentDocuments: documents.slice(0, 5), // Latest 5 documents
    };
  }

  /**
   * Example: Cross-DB analytics query
   * This combines data from both MySQL and MongoDB
   */
  async getCrossDBAnalytics() {
    // Get research document statistics
    const researchStats = await this.researchDocumentsService.getStatistics();
    
    // This would typically combine with MySQL data:
    // const projectStats = await this.projectsService.getProjectStatistics();
    // const vendorStats = await this.vendorsService.getVendorStatistics();

    return {
      researchDocuments: {
        totalDocuments: researchStats.totalDocuments,
        documentsByProject: researchStats.documentsByProject,
        mostUsedTags: researchStats.mostUsedTags,
      },
      // projectStats, // From MySQL
      // vendorStats,  // From MySQL
    };
  }
}
