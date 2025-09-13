import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ResearchDocument, ResearchDocumentModel } from './research-document.schema';
import { CreateResearchDocumentDto } from './dto/create-research-document.dto';
import { UpdateResearchDocumentDto } from './dto/update-research-document.dto';
import { SearchResearchDocumentsDto } from './dto/search-research-documents.dto';

@Injectable()
export class ResearchDocumentsService {
  constructor(
    @InjectModel(ResearchDocumentModel.name)
    private researchDocumentModel: Model<ResearchDocument>,
  ) {}

  async create(createResearchDocumentDto: CreateResearchDocumentDto): Promise<ResearchDocument> {
    try {
      const createdDocument = new this.researchDocumentModel(createResearchDocumentDto);
      return await createdDocument.save();
    } catch (error) {
      throw new BadRequestException('Failed to create research document');
    }
  }

  async findAll(searchDto: SearchResearchDocumentsDto = {}): Promise<{
    documents: ResearchDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      searchText,
      tags,
      projectId,
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = searchDto;

    const filter: FilterQuery<ResearchDocument> = {};

    // Text search across title and content
    if (searchText) {
      filter.$text = { $search: searchText };
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Filter by project ID
    if (projectId) {
      filter.projectId = projectId;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.researchDocumentModel
        .find(filter)
        .sort(searchText ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.researchDocumentModel.countDocuments(filter).exec(),
    ]);

    return {
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ResearchDocument> {
    const document = await this.researchDocumentModel.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Research document not found');
    }
    return document;
  }

  async findByProjectId(projectId: number): Promise<ResearchDocument[]> {
    return this.researchDocumentModel.find({ projectId }).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, updateResearchDocumentDto: UpdateResearchDocumentDto): Promise<ResearchDocument> {
    const updatedDocument = await this.researchDocumentModel
      .findByIdAndUpdate(id, { ...updateResearchDocumentDto, updatedAt: new Date() }, { new: true })
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException('Research document not found');
    }

    return updatedDocument;
  }

  async remove(id: string): Promise<void> {
    const result = await this.researchDocumentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Research document not found');
    }
  }

  async searchByTags(tags: string[]): Promise<ResearchDocument[]> {
    return this.researchDocumentModel
      .find({ tags: { $in: tags } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDocumentsCountByProject(projectId: number): Promise<number> {
    return this.researchDocumentModel.countDocuments({ projectId }).exec();
  }
  async countByProjectIds(projectIds: number[]): Promise<number> {
    return this.researchDocumentModel.countDocuments({ projectId: { $in: projectIds } }).exec();
  }
  

  async getDocumentsCountByProjectAndCountry(projectId: number, country?: string): Promise<number> {
    const filter: FilterQuery<ResearchDocument> = { projectId };
    
    // If country is specified, search in content or tags for country references
    if (country) {
      filter.$or = [
        { content: { $regex: country, $options: 'i' } },
        { tags: { $regex: country, $options: 'i' } },
      ];
    }

    return this.researchDocumentModel.countDocuments(filter).exec();
  }

  // Get aggregated statistics
  async getStatistics(projectId?: number): Promise<{
    totalDocuments: number;
    documentsByProject: { projectId: number; count: number }[];
    mostUsedTags: { tag: string; count: number }[];
  }> {
    const baseFilter = projectId ? { projectId } : {};

    const [totalDocuments, documentsByProject, tagStats] = await Promise.all([
      this.researchDocumentModel.countDocuments(baseFilter),
      this.researchDocumentModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
        { $project: { projectId: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
      this.researchDocumentModel.aggregate([
        { $match: baseFilter },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $project: { tag: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      totalDocuments,
      documentsByProject,
      mostUsedTags: tagStats,
    };
  }
}
