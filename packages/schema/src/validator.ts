import { z } from 'zod';

export type EntityType =
  | 'Product'
  | 'Offer'
  | 'Specification'
  | 'Review'
  | 'Question'
  | 'Navigation'
  | 'CallToAction'
  | 'Image'
  | 'CodeBlock'
  | 'Quote';

export type IntentType = 'transactional' | 'informational' | 'comparative' | 'navigational';
export type PageType = 'product' | 'pricing' | 'comparison' | 'review' | 'blog' | 'faq' | 'landing';
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

const EntityMetadataSchema = z.record(z.unknown());

const ProductEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Product'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  normalizedName: z.string(),
  description: z.string().optional(),
  image: z.any().optional(),
  aggregateRating: z.object({
    ratingValue: z.number(),
    reviewCount: z.number(),
  }).optional(),
  brand: z.object({
    name: z.string(),
    logo: z.string().optional(),
  }).optional(),
  category: z.array(z.string()).optional(),
});

const OfferEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Offer'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  price: z.number(),
  priceCurrency: z.string(),
  priceValidUntil: z.string().optional(),
  availability: z.enum(['InStock', 'OutOfStock', 'PreOrder']).optional(),
  seller: z.object({
    name: z.string(),
    logo: z.string().optional(),
  }).optional(),
  comparableValue: z.number().optional(),
});

const SpecificationEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Specification'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  comparableValue: z.number().optional(),
  category: z.enum(['technical', 'physical', 'performance']).optional(),
});

const ReviewEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Review'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  author: z.string(),
  rating: z.number(),
  title: z.string().optional(),
  body: z.string(),
  datePublished: z.string().optional(),
  isVerifiedPurchase: z.boolean().optional(),
  helpfulVotes: z.number().optional(),
});

const QuestionEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Question'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  question: z.string(),
  acceptedAnswer: z.object({
    text: z.string(),
    '@type': z.literal('Answer'),
  }),
});

export type NavigationEntity = {
  id: string;
  type: 'Navigation';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  name: string;
  url: string;
  position: number;
  children?: NavigationEntity[];
};

export const NavigationEntitySchema: z.ZodType<NavigationEntity> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.literal('Navigation'),
    content: z.string(),
    normalizedContent: z.string(),
    confidence: z.number().min(0).max(1),
    boundingContext: z.string(),
    metadata: EntityMetadataSchema,
    name: z.string(),
    url: z.string(),
    position: z.number(),
    children: z.array(NavigationEntitySchema).optional(),
  }),
);

const CallToActionEntitySchema = z.object({
  id: z.string(),
  type: z.literal('CallToAction'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  text: z.string(),
  url: z.string(),
  style: z.enum(['primary', 'secondary', 'link']).optional(),
  position: z.enum(['inline', 'floating', 'footer']).optional(),
  intent: z.enum(['buy', 'subscribe', 'contact', 'download', 'signup']),
});

const ImageEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Image'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  url: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const CodeBlockEntitySchema = z.object({
  id: z.string(),
  type: z.literal('CodeBlock'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  language: z.string(),
  code: z.string(),
});

const QuoteEntitySchema = z.object({
  id: z.string(),
  type: z.literal('Quote'),
  content: z.string(),
  normalizedContent: z.string(),
  confidence: z.number().min(0).max(1),
  boundingContext: z.string(),
  metadata: EntityMetadataSchema,
  quote: z.string(),
  attribution: z.string().optional(),
  source: z.string().optional(),
});

export const EntitySchema = z.union([
  ProductEntitySchema,
  OfferEntitySchema,
  SpecificationEntitySchema,
  ReviewEntitySchema,
  QuestionEntitySchema,
  NavigationEntitySchema,
  CallToActionEntitySchema,
  ImageEntitySchema,
  CodeBlockEntitySchema,
  QuoteEntitySchema,
]);

export type Entity = z.infer<typeof EntitySchema>;

export const RelationshipSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum([
    'hierarchical',
    'comparative',
    'temporal',
    'specification',
    'pricing',
    'review_of',
    'faq_about',
    'media_of',
    'navigation_to',
    'call_to',
    'related',
    'same_as',
  ]),
  confidence: z.number().min(0).max(1),
  bidirectional: z.boolean(),
  metadata: z.object({
    extractionMethod: z.enum(['explicit', 'inferred', 'contextual']),
    boundingContext: z.string(),
  }),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

export const IntentSignalsSchema = z.object({
  hasPrice: z.boolean(),
  hasBuyIntent: z.boolean(),
  isComparison: z.boolean(),
  isHowTo: z.boolean(),
  isTroubleshooting: z.boolean(),
  isProductPage: z.boolean(),
});

export const IntentClassificationSchema = z.object({
  primary: z.enum(['transactional', 'informational', 'comparative', 'navigational']),
  secondary: z.array(z.enum(['transactional', 'informational', 'comparative', 'navigational'])).optional(),
  confidence: z.number().min(0).max(1),
  signals: IntentSignalsSchema,
  pageType: z.enum(['product', 'pricing', 'comparison', 'review', 'blog', 'faq', 'landing']),
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

export const ConfidenceFactorsSchema = z.object({
  structureQuality: z.number().min(0).max(1),
  contentCompleteness: z.number().min(0).max(1),
  dataExtractionAccuracy: z.number().min(0).max(1),
  relationshipClarity: z.number().min(0).max(1),
});

export const ConfidenceScoreSchema = z.object({
  overall: z.number().min(0).max(1),
  factors: ConfidenceFactorsSchema,
  warnings: z.array(z.string()),
  extractedAt: z.string(),
});

export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>;

export const DocumentMetadataSchema = z.object({
  sourceUrl: z.string().optional(),
  sourceDomain: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  language: z.string(),
  generatedAt: z.string(),
  contentHash: z.string().optional(),
  parserVersion: z.string(),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export const LLMContentSchema = z.object({
  llmseo_version: z.literal('1.0'),
  metadata: DocumentMetadataSchema,
  entities: z.array(EntitySchema),
  relationships: z.array(RelationshipSchema),
  intent: IntentClassificationSchema,
  confidence: ConfidenceScoreSchema,
});

export type LLMContent = z.infer<typeof LLMContentSchema>;

export function validateSchema(data: unknown): { success: true; data: LLMContent } | { success: false; errors: string[] } {
  const result = LLMContentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

export function isEntityOfType(entity: Entity, type: EntityType): boolean {
  return entity.type === type;
}

export function getEntityById(entities: Entity[], id: string): Entity | undefined {
  return entities.find(e => e.id === id);
}

export function getEntitiesByType(entities: Entity[], type: EntityType): Entity[] {
  return entities.filter(e => e.type === type);
}