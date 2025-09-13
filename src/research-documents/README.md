# Research Documents Module

This module provides functionality for managing research documents in MongoDB, including file uploads, search capabilities, and document management.

## Features

- **Document Storage**: Store market reports and project research files in MongoDB
- **File Upload**: Upload documents with metadata (title, content, tags, projectId)
- **Search & Query**: Search documents by text, tags, or project
- **Project Linking**: Each document is linked to a project via projectId
- **Authentication**: JWT-based authentication with role-based access control
- **File Management**: Support for common document types (PDF, DOC, DOCX, TXT, XLS, XLSX, CSV)

## API Endpoints

### Document Management

- `POST /research-documents` - Create a new research document (with optional file upload)
- `GET /research-documents` - Get all documents with optional search filters
- `GET /research-documents/:id` - Get a specific document by ID
- `PATCH /research-documents/:id` - Update a document
- `DELETE /research-documents/:id` - Delete a document

### Search & Query

- `GET /research-documents/search` - Search documents with advanced filters
- `GET /research-documents/by-project/:projectId` - Get documents by project ID
- `GET /research-documents/by-tags?tags=tag1,tag2` - Search documents by tags
- `GET /research-documents/count/by-project/:projectId` - Get document count by project
- `GET /research-documents/count/by-project-and-country/:projectId?country=USA` - Get document count by project and country

### Statistics

- `GET /research-documents/statistics` - Get aggregated statistics
- `GET /research-documents/statistics?projectId=123` - Get statistics for specific project

## Request/Response Examples

### Create Document with File Upload

```bash
curl -X POST http://localhost:3000/research-documents \
  -H "Authorization: Bearer <jwt-token>" \
  -F "title=Market Analysis Report" \
  -F "content=This report analyzes the market trends..." \
  -F "tags=market-analysis,trends,expansion" \
  -F "projectId=123" \
  -F "file=@report.pdf"
```

### Search Documents

```bash
# Search by text
curl "http://localhost:3000/research-documents/search?searchText=market%20analysis"

# Search by tags
curl "http://localhost:3000/research-documents/by-tags?tags=market-analysis,trends"

# Search by project
curl "http://localhost:3000/research-documents/by-project/123"

# Advanced search with filters
curl "http://localhost:3000/research-documents/search?searchText=expansion&tags=market-analysis&projectId=123&page=1&limit=10"
```

## Data Schema

### Research Document Schema

```typescript
{
  title: string;           // Document title
  content: string;         // Document content/description
  tags: string[];          // Array of tags for categorization
  projectId: number;       // Reference to project ID
  fileUrl?: string;        // URL to uploaded file
  mimeType?: string;       // MIME type of uploaded file
  fileSize?: number;       // Size of uploaded file in bytes
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last update timestamp
}
```

## File Upload Support

- **Supported Types**: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV
- **File Size Limit**: 10MB
- **Storage Location**: `./uploads/research-documents/`
- **Access URL**: `/uploads/research-documents/{filename}`

## Authentication & Authorization

- **JWT Authentication**: Required for all endpoints
- **Role-based Access**: Both CLIENT and ADMIN roles can access
- **File Upload**: Requires proper authentication

## MongoDB Indexes

The module creates the following indexes for optimal performance:

- `projectId` - For project-based queries
- `tags` - For tag-based searches
- `title` and `content` - Text search index

## Error Handling

- **404**: Document not found
- **400**: Bad request (invalid file type, validation errors)
- **401**: Unauthorized (missing or invalid JWT)
- **403**: Forbidden (insufficient permissions)

## Usage Examples

### In Analytics Service (Cross-DB Query)

```typescript
// Get document count for analytics
const documentCount =
  await this.researchDocumentsService.getDocumentsCountByProjectAndCountry(
    projectId,
    country,
  );
```

### Statistics for Dashboard

```typescript
// Get comprehensive statistics
const stats = await this.researchDocumentsService.getStatistics();
// Returns: { totalDocuments, documentsByProject, mostUsedTags }
```
