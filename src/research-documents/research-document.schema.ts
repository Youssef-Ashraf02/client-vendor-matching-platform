import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResearchDocument = ResearchDocumentModel & Document;

@Schema({ timestamps: true })
export class ResearchDocumentModel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, type: Number })
  projectId: number;

  @Prop({ type: String })
  fileUrl?: string;

  @Prop({ type: String })
  mimeType?: string;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ResearchDocumentSchema = SchemaFactory.createForClass(ResearchDocumentModel);

// Create indexes for better search performance
ResearchDocumentSchema.index({ projectId: 1 });
ResearchDocumentSchema.index({ tags: 1 });
ResearchDocumentSchema.index({ title: 'text', content: 'text' });
