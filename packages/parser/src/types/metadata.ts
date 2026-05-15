/**
 * Document Metadata
 */

export interface DocumentMetadata {
  sourceUrl?: string;
  sourceDomain?: string;
  title: string;
  description?: string;
  language: string;
  generatedAt: string;
  contentHash?: string;
  parserVersion: string;
}