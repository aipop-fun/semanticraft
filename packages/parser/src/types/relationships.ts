/**
 * Relationship Types - Links between entities
 */

export type RelationshipType =
  | 'hierarchical'
  | 'comparative'
  | 'temporal'
  | 'specification'
  | 'pricing'
  | 'review_of'
  | 'faq_about'
  | 'media_of'
  | 'navigation_to'
  | 'call_to'
  | 'related'
  | 'same_as';

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  confidence: number;
  bidirectional: boolean;
  metadata: {
    extractionMethod: 'explicit' | 'inferred' | 'contextual';
    boundingContext: string;
  };
}

export interface UsageHint {
  relationship: string;
  hint: string;
  queryTypes: ('transactional' | 'informational' | 'comparative')[];
}