/**
 * Entity Types - Core types extracted from Markdown content
 */

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

export interface BaseEntity {
  id: string;
  type: EntityType;
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
}

export interface ProductEntity extends BaseEntity {
  type: 'Product';
  normalizedName: string;
  description?: string;
  image?: ImageEntity;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  brand?: {
    name: string;
    logo?: string;
  };
  category?: string[];
}

export interface OfferEntity extends BaseEntity {
  type: 'Offer';
  price: number;
  priceCurrency: 'BRL' | 'USD' | 'EUR' | string;
  priceValidUntil?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  seller?: {
    name: string;
    logo?: string;
  };
  comparableValue?: number;
}

export interface SpecificationEntity extends BaseEntity {
  type: 'Specification';
  name: string;
  value: string;
  unit?: string;
  comparableValue?: number;
  category?: 'technical' | 'physical' | 'performance';
}

export interface ReviewEntity extends BaseEntity {
  type: 'Review';
  author: string;
  rating: number;
  title?: string;
  body: string;
  datePublished?: string;
  isVerifiedPurchase?: boolean;
  helpfulVotes?: number;
}

export interface QuestionEntity extends BaseEntity {
  type: 'Question';
  question: string;
  acceptedAnswer: {
    text: string;
    '@type': 'Answer';
  };
}

export interface NavigationEntity extends BaseEntity {
  type: 'Navigation';
  name: string;
  url: string;
  position: number;
  children?: NavigationEntity[];
}

export interface CallToActionEntity extends BaseEntity {
  type: 'CallToAction';
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'link';
  position?: 'inline' | 'floating' | 'footer';
  intent: 'buy' | 'subscribe' | 'contact' | 'download' | 'signup';
}

export interface ImageEntity extends BaseEntity {
  type: 'Image';
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CodeBlockEntity extends BaseEntity {
  type: 'CodeBlock';
  language: string;
  code: string;
}

export interface QuoteEntity extends BaseEntity {
  type: 'Quote';
  text: string;
  author?: string;
  source?: string;
}

export type Entity =
  | ProductEntity
  | OfferEntity
  | SpecificationEntity
  | ReviewEntity
  | QuestionEntity
  | NavigationEntity
  | CallToActionEntity
  | ImageEntity
  | CodeBlockEntity
  | QuoteEntity;