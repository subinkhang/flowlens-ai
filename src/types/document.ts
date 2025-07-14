export interface Document {
  documentId: string;
  documentName: string;
  documentType: 'INTERNAL' | 'REFERENCE';
  sourceUrl?: string;
  s3Path?: string;
  createdAt: string;
  ownerId?: string;
  content: string;
  textContent?: string;
}