/**
 * Core LLMContent output type
 */

import type { DocumentMetadata } from './metadata';
import type { Entity } from './entities';
import type { Relationship } from './relationships';
import type { IntentClassification, ConfidenceScore } from './intent';

export type { Entity, ProductEntity } from './entities';
export type { Relationship } from './relationships';
export type { IntentClassification, ConfidenceScore } from './intent';
export type { IntentType } from './intent';

export interface LLMContent {
  llmseo_version: '1.0';
  metadata: DocumentMetadata;
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
}

export interface ParseOptions {
  extractEntities?: boolean;
  resolveRelationships?: boolean;
  calculateConfidence?: boolean;
  includeIntent?: boolean;
  maxNestingDepth?: number;
  strictMode?: boolean;
  sourceUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}