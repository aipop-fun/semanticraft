import type {
  LLMContent,
  ParseOptions,
  Entity,
  Relationship,
  IntentClassification,
  ConfidenceScore,
} from '@semanticraft/parser';

export type SemanticraftMode = 'static' | 'dynamic' | 'ssr';

export interface SemanticraftConfig {
  apiKey?: string;
  contentSelector?: string;
  mode?: SemanticraftMode;
  parseOptions?: ParseOptions;
  onError?: (error: Error) => void;
}

export interface SemanticraftContextValue {
  config: SemanticraftConfig;
  parse: (content: string) => Promise<LLMContent>;
  parsedContent: LLMContent | null;
  isLoading: boolean;
  error: Error | null;
}

export interface SemanticraftContentProps {
  children: string;
  selector?: string;
  parseOptions?: ParseOptions;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  fallback?: React.ReactNode;
}

export interface UseSemanticraftReturn {
  data: LLMContent | null;
  parse: (content: string) => Promise<LLMContent>;
  isLoading: boolean;
  error: Error | null;
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification | null;
  confidence: ConfidenceScore | null;
}

export type { LLMContent, ParseOptions, Entity, Relationship, IntentClassification, ConfidenceScore };