export { generateSchema, generateFromPartial, mergeSchemas } from './generator';
export type { GeneratorInput, GeneratorResult, LLMContent } from './generator';

export {
  validateSchema,
  EntitySchema,
  RelationshipSchema,
  IntentClassificationSchema,
  ConfidenceScoreSchema,
  DocumentMetadataSchema,
  LLMContentSchema,
  isEntityOfType,
  getEntityById,
  getEntitiesByType,
} from './validator';
export type {
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
  IntentClassification,
  IntentType,
  PageType,
  ConfidenceScore,
  DocumentMetadata,
} from './validator';

export {
  classifyIntent,
  detectSignals,
  determineIntent,
  calculateIntentConfidence,
  inferPageType,
  mergeIntentClassification,
} from './intent';
export type { IntentSignal } from './intent';

export {
  calculateConfidence,
  evaluateEntityQuality,
  calculateStructureQuality,
  calculateContentCompleteness,
  calculateDataExtractionAccuracy,
  calculateRelationshipClarity,
  mergeConfidenceScores,
  isHighConfidence,
  getConfidenceLevel,
} from './confidence';
export type { ConfidenceInput, EntityQuality } from './confidence';