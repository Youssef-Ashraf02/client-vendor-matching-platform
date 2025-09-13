import { Test, TestingModule } from '@nestjs/testing';
import { ResearchDocumentsController } from './research-documents.controller';
import { ResearchDocumentsService } from './research-documents.service';
import { getModelToken } from '@nestjs/mongoose';
import { ResearchDocumentModel } from './research-document.schema';

describe('ResearchDocumentsController', () => {
  let controller: ResearchDocumentsController;
  let service: ResearchDocumentsService;

  const mockResearchDocumentModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResearchDocumentsController],
      providers: [
        ResearchDocumentsService,
        {
          provide: getModelToken(ResearchDocumentModel.name),
          useValue: mockResearchDocumentModel,
        },
      ],
    }).compile();

    controller = module.get<ResearchDocumentsController>(ResearchDocumentsController);
    service = module.get<ResearchDocumentsService>(ResearchDocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findAll when getting all documents', async () => {
    const mockDocuments = {
      documents: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    jest.spyOn(service, 'findAll').mockResolvedValue(mockDocuments);

    const result = await controller.findAll({});

    expect(service.findAll).toHaveBeenCalledWith({});
    expect(result).toEqual(mockDocuments);
  });

  it('should call service.create when creating a document', async () => {
    const createDto = {
      title: 'Test Document',
      content: 'Test content',
      tags: ['test'],
      projectId: 1,
    };

    const mockDocument = {
      ...createDto,
      _id: '507f1f77bcf86cd799439011',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(service, 'create').mockResolvedValue(mockDocument as any);

    const result = await controller.create(createDto);

    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockDocument);
  });
});
