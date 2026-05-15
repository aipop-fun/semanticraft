import type { Entity, IntentClassification, ConfidenceScore, Relationship, DocumentMetadata } from './validator';

export interface GeneratorInput {
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
  metadata: DocumentMetadata;
}

export interface GeneratorResult {
  success: boolean;
  data?: LLMContent;
  errors?: string[];
}

export interface LLMContent {
  llmseo_version: '1.0';
  metadata: DocumentMetadata;
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
}

const SCHEMA_VERSION = '1.0';
const CURRENT_PARSER_VERSION = '0.1.0-alpha.1';

function validateInput(input: GeneratorInput): string[] {
  const errors: string[] = [];

  if (!input.entities || !Array.isArray(input.entities)) {
    errors.push('entities must be a non-empty array');
  }

  if (!input.relationships || !Array.isArray(input.relationships)) {
    errors.push('relationships must be an array');
  }

  if (!input.intent) {
    errors.push('intent is required');
  }

  if (!input.confidence) {
    errors.push('confidence is required');
  }

  if (!input.metadata) {
    errors.push('metadata is required');
  }

  return errors;
}

function enrichMetadata(metadata: DocumentMetadata): DocumentMetadata {
  return {
    ...metadata,
    generatedAt: new Date().toISOString(),
    parserVersion: CURRENT_PARSER_VERSION,
  };
}

function enrichEntities(entities: Entity[]): Entity[] {
  return entities.map(entity => ({
    ...entity,
    boundingContext: entity.boundingContext || '',
    metadata: entity.metadata || {},
  }));
}

function enrichRelationships(relationships: Relationship[]): Relationship[] {
  return relationships.map(rel => ({
    ...rel,
    metadata: rel.metadata || {
      extractionMethod: 'explicit' as const,
      boundingContext: '',
    },
  }));
}

function enrichConfidence(confidence: ConfidenceScore): ConfidenceScore {
  return {
    ...confidence,
    extractedAt: confidence.extractedAt || new Date().toISOString(),
    warnings: confidence.warnings || [],
  };
}

export function generateSchema(input: GeneratorInput): GeneratorResult {
  const errors = validateInput(input);
  if (errors.length > 0) {
    return { success: false, errors };
  }

  const content: LLMContent = {
    llmseo_version: SCHEMA_VERSION,
    metadata: enrichMetadata(input.metadata),
    entities: enrichEntities(input.entities),
    relationships: enrichRelationships(input.relationships),
    intent: input.intent,
    confidence: enrichConfidence(input.confidence),
  };

  return { success: true, data: content };
}

export function generateFromPartial(partial: {
  entities?: Entity[];
  relationships?: Relationship[];
  intent?: IntentClassification;
  confidence?: ConfidenceScore;
  metadata?: Partial<DocumentMetadata>;
}): GeneratorResult {
  const now = new Date().toISOString();

  const metadata: DocumentMetadata = {
    title: partial.metadata?.title || 'Untitled',
    language: partial.metadata?.language || 'en',
    generatedAt: partial.metadata?.generatedAt || now,
    parserVersion: partial.metadata?.parserVersion || CURRENT_PARSER_VERSION,
    sourceUrl: partial.metadata?.sourceUrl,
    sourceDomain: partial.metadata?.sourceDomain,
    description: partial.metadata?.description,
    contentHash: partial.metadata?.contentHash,
  };

  const defaultConfidence: ConfidenceScore = {
    overall: 0.5,
    factors: {
      structureQuality: 0.5,
      contentCompleteness: 0.5,
      dataExtractionAccuracy: 0.5,
      relationshipClarity: 0.5,
    },
    warnings: [],
    extractedAt: now,
  };

  return generateSchema({
    entities: partial.entities || [],
    relationships: partial.relationships || [],
    intent: partial.intent || {
      primary: 'informational',
      confidence: 0.5,
      signals: {
        hasPrice: false,
        hasBuyIntent: false,
        isComparison: false,
        isHowTo: false,
        isTroubleshooting: false,
        isProductPage: false,
      },
      pageType: 'landing',
    },
    confidence: partial.confidence || defaultConfidence,
    metadata,
  });
}

export function mergeSchemas(...schemas: LLMContent[]): LLMContent {
  if (schemas.length === 0) {
    throw new Error('At least one schema required');
  }

  if (schemas.length === 1) {
    return schemas[0];
  }

  const now = new Date().toISOString();

  return {
    llmseo_version: SCHEMA_VERSION,
    metadata: {
      title: schemas[0]?.metadata.title || 'Merged',
      language: schemas[0]?.metadata.language || 'en',
      generatedAt: now,
      parserVersion: CURRENT_PARSER_VERSION,
    },
    entities: schemas.flatMap(s => s.entities),
    relationships: schemas.flatMap(s => s.relationships),
    intent: schemas[0]?.intent || {
      primary: 'informational',
      confidence: 0.5,
      signals: {
        hasPrice: false,
        hasBuyIntent: false,
        isComparison: false,
        isHowTo: false,
        isTroubleshooting: false,
        isProductPage: false,
      },
      pageType: 'landing',
    },
    confidence: schemas[0]?.confidence || {
      overall: 0.5,
      factors: {
        structureQuality: 0.5,
        contentCompleteness: 0.5,
        dataExtractionAccuracy: 0.5,
        relationshipClarity: 0.5,
      },
      warnings: [],
      extractedAt: now,
    },
  };
}