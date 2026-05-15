/**
 * Intent Classification - How LLMs should interpret the content
 */

export type IntentType = 'transactional' | 'informational' | 'comparative' | 'navigational';

export type PageType = 'product' | 'pricing' | 'comparison' | 'review' | 'blog' | 'faq' | 'landing';

export interface IntentClassification {
  primary: IntentType;
  secondary?: IntentType[];
  confidence: number;
  signals: {
    hasPrice: boolean;
    hasBuyIntent: boolean;
    isComparison: boolean;
    isHowTo: boolean;
    isTroubleshooting: boolean;
    isProductPage: boolean;
  };
  pageType: PageType;
}

export interface ConfidenceScore {
  overall: number;
  factors: {
    structureQuality: number;
    contentCompleteness: number;
    dataExtractionAccuracy: number;
    relationshipClarity: number;
  };
  warnings: string[];
  extractedAt: string;
}