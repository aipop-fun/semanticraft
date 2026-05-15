import type { Entity, Relationship, ConfidenceScore } from './validator';

export interface EntityQuality {
  hasContent: boolean;
  hasBoundingContext: boolean;
  hasMetadata: boolean;
  contentLength: number;
  confidence: number;
}

export interface ConfidenceInput {
  entities: Entity[];
  relationships: Relationship[];
  markdownLength?: number;
  parseErrors?: string[];
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceScore {
  const entityQualities = input.entities.map(evaluateEntityQuality);
  const structureQuality = calculateStructureQuality(entityQualities, input.relationships);
  const contentCompleteness = calculateContentCompleteness(entityQualities, input.markdownLength);
  const dataExtractionAccuracy = calculateDataExtractionAccuracy(entityQualities);
  const relationshipClarity = calculateRelationshipClarity(input.relationships, input.entities);

  const factorWeights = {
    structureQuality: 0.25,
    contentCompleteness: 0.3,
    dataExtractionAccuracy: 0.25,
    relationshipClarity: 0.2,
  };

  const overall =
    structureQuality * factorWeights.structureQuality +
    contentCompleteness * factorWeights.contentCompleteness +
    dataExtractionAccuracy * factorWeights.dataExtractionAccuracy +
    relationshipClarity * factorWeights.relationshipClarity;

  const warnings: string[] = [];

  if (structureQuality < 0.5) {
    warnings.push('Low structure quality detected');
  }

  if (contentCompleteness < 0.5) {
    warnings.push('Content completeness below threshold');
  }

  if (dataExtractionAccuracy < 0.6) {
    warnings.push('Data extraction accuracy could be improved');
  }

  if (relationshipClarity < 0.4) {
    warnings.push('Relationship clarity is low - consider adding more explicit relationships');
  }

  const entityCountByType: Record<string, number> = {};
  for (const entity of input.entities) {
    entityCountByType[entity.type] = (entityCountByType[entity.type] || 0) + 1;
  }

  const highConfidenceCount = entityQualities.filter(q => q.confidence > 0.7).length;
  if (highConfidenceCount / entityQualities.length < 0.5) {
    warnings.push('Less than 50% of entities have high confidence');
  }

  return {
    overall: Math.round(overall * 100) / 100,
    factors: {
      structureQuality: Math.round(structureQuality * 100) / 100,
      contentCompleteness: Math.round(contentCompleteness * 100) / 100,
      dataExtractionAccuracy: Math.round(dataExtractionAccuracy * 100) / 100,
      relationshipClarity: Math.round(relationshipClarity * 100) / 100,
    },
    warnings,
    extractedAt: new Date().toISOString(),
  };
}

export function evaluateEntityQuality(entity: Entity): EntityQuality {
  const contentLength = entity.content.length;
  const hasContent = contentLength > 0;
  const hasBoundingContext = entity.boundingContext.length > 10;
  const hasMetadata = Object.keys(entity.metadata).length > 0;

  return {
    hasContent,
    hasBoundingContext,
    hasMetadata,
    contentLength,
    confidence: entity.confidence,
  };
}

export function calculateStructureQuality(
  entityQualities: EntityQuality[],
  relationships: Relationship[]
): number {
  if (entityQualities.length === 0) {
    return 0;
  }

  const qualityScores = entityQualities.map(q => {
    let score = 0;

    if (q.hasContent) score += 0.3;
    if (q.hasBoundingContext) score += 0.3;
    if (q.hasMetadata) score += 0.2;
    score += Math.min(0.2, q.contentLength / 1000);

    return score;
  });

  const avgEntityQuality = qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length;

  const relationshipRatio = relationships.length / Math.max(entityQualities.length, 1);
  const relationshipBonus = Math.min(0.15, relationshipRatio * 0.05);

  return Math.min(1, avgEntityQuality + relationshipBonus);
}

export function calculateContentCompleteness(
  entityQualities: EntityQuality[],
  markdownLength?: number
): number {
  if (entityQualities.length === 0) {
    return 0;
  }

  const filledEntities = entityQualities.filter(q => q.hasContent).length;
  let completeness = filledEntities / entityQualities.length;

  if (markdownLength && markdownLength > 0) {
    const avgContentLength = entityQualities.reduce((sum, q) => sum + q.contentLength, 0) / entityQualities.length;
    const contentDensity = avgContentLength / Math.max(markdownLength, 1);
    completeness = completeness * 0.7 + Math.min(0.3, contentDensity * 10) * 0.3;
  }

  return Math.min(1, completeness);
}

export function calculateDataExtractionAccuracy(
  entityQualities: EntityQuality[]
): number {
  if (entityQualities.length === 0) {
    return 0;
  }

  const confidenceSum = entityQualities.reduce((sum, q) => sum + q.confidence, 0);
  const avgConfidence = confidenceSum / entityQualities.length;

  const highConfidenceRatio = entityQualities.filter(q => q.confidence > 0.7).length / entityQualities.length;

  return avgConfidence * 0.6 + highConfidenceRatio * 0.4;
}

export function calculateRelationshipClarity(
  relationships: Relationship[],
  entities: Entity[]
): number {
  if (relationships.length === 0) {
    return 0.3;
  }

  const highConfidenceRelationships = relationships.filter(r => r.confidence > 0.7).length;
  const relationshipConfidence = highConfidenceRelationships / relationships.length;

  const entityIds = new Set(entities.map(e => e.id));
  const validSourceCount = relationships.filter(r => entityIds.has(r.source)).length;
  const validTargetCount = relationships.filter(r => entityIds.has(r.target)).length;
  const validReferences = validSourceCount + validTargetCount;
  const totalReferences = relationships.length * 2;

  const referenceValidity = totalReferences > 0 ? validReferences / totalReferences : 0;

  return relationshipConfidence * 0.5 + referenceValidity * 0.5;
}

export function mergeConfidenceScores(...scores: ConfidenceScore[]): ConfidenceScore {
  if (scores.length === 0) {
    return {
      overall: 0,
      factors: {
        structureQuality: 0,
        contentCompleteness: 0,
        dataExtractionAccuracy: 0,
        relationshipClarity: 0,
      },
      warnings: [],
      extractedAt: new Date().toISOString(),
    };
  }

  if (scores.length === 1) {
    return scores[0];
  }

  const avgOverall = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;

  const avgStructureQuality = scores.reduce((sum, s) => sum + s.factors.structureQuality, 0) / scores.length;
  const avgContentCompleteness = scores.reduce((sum, s) => sum + s.factors.contentCompleteness, 0) / scores.length;
  const avgDataExtractionAccuracy = scores.reduce((sum, s) => sum + s.factors.dataExtractionAccuracy, 0) / scores.length;
  const avgRelationshipClarity = scores.reduce((sum, s) => sum + s.factors.relationshipClarity, 0) / scores.length;

  const allWarnings = scores.flatMap(s => s.warnings);

  return {
    overall: Math.round(avgOverall * 100) / 100,
    factors: {
      structureQuality: Math.round(avgStructureQuality * 100) / 100,
      contentCompleteness: Math.round(avgContentCompleteness * 100) / 100,
      dataExtractionAccuracy: Math.round(avgDataExtractionAccuracy * 100) / 100,
      relationshipClarity: Math.round(avgRelationshipClarity * 100) / 100,
    },
    warnings: allWarnings.slice(0, 10),
    extractedAt: new Date().toISOString(),
  };
}

export function isHighConfidence(score: ConfidenceScore, threshold = 0.7): boolean {
  return score.overall >= threshold;
}

export function getConfidenceLevel(score: ConfidenceScore): 'low' | 'medium' | 'high' {
  if (score.overall >= 0.8) return 'high';
  if (score.overall >= 0.5) return 'medium';
  return 'low';
}