import { v4 as uuidv4 } from 'uuid';
import type { Entity, EntityType, BaseEntity } from './types/entities';
import type { Relationship, RelationshipType } from './types/relationships';
import type { IntentClassification } from './types/intent';
import type { DocumentMetadata } from './types/metadata';
import type { LLMContent, ParseOptions, ValidationResult } from './types/index';

const PRICE_PATTERNS = [
  /R\$\s*(\d+(?:[.,]\d{2})?)/i,
  /\$\s*(\d+(?:[.,]\d{2})?)/,
  /€\s*(\d+(?:[.,]\d{2})?)/,
  /(\d+(?:[.,]\d{2})?)\s*(?:reais|dollars|euros)/i,
];

const CURRENCY_MAP: Record<string, string> = {
  'R$': 'BRL',
  '$': 'USD',
  '€': 'EUR',
};

function extractPrice(text: string): { price: number; currency: string } | null {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const currencySymbol = match[0].slice(0, 2).trim();
      const currency = CURRENCY_MAP[currencySymbol] || 'BRL';
      const priceStr = match[1].replace(',', '.');
      return { price: parseFloat(priceStr), currency };
    }
  }
  return null;
}

function normalizeText(text: string): string {
  return text
    .replace(/[#*_`~\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractHeadings(markdown: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const pattern = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
    });
  }
  return headings;
}

function extractLists(markdown: string): string[] {
  const items: string[] = [];
  const pattern = /^[\s]*[-*+]\s+(.+)$/gm;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    items.push(match[1].trim());
  }
  return items;
}

function extractFAQs(markdown: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const pattern = /\*\*[Pp]\:\*\*\s*(.+?)\n[Aa]\w*:\s*(.+?)(?=\n\n|\n##|$)/gs;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim(),
    });
  }
  return faqs;
}

function extractEntities(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const headings = extractHeadings(markdown);
  const lists = extractLists(markdown);
  const faqs = extractFAQs(markdown);

  if (headings.length > 0 && headings[0].level === 1) {
    const productEntity: Entity = {
      id: uuidv4(),
      type: 'Product',
      content: headings[0].text,
      normalizedContent: normalizeText(headings[0].text),
      confidence: 0.95,
      boundingContext: markdown.slice(0, 200),
      metadata: {
        extractedFrom: 'heading',
        headingLevel: 1,
      },
    };
    entities.push(productEntity);
  }

  const priceMatch = markdown.match(/\*\*[Pp]reço:\*\*\s*(.+)/i);
  if (priceMatch) {
    const priceData = extractPrice(priceMatch[1]);
    if (priceData) {
      const offerEntity: Entity = {
        id: uuidv4(),
        type: 'Offer',
        content: priceMatch[1].trim(),
        normalizedContent: normalizeText(priceMatch[1]),
        confidence: priceData.price > 0 ? 0.98 : 0.5,
        boundingContext: priceMatch[0],
        metadata: {
          extractedFrom: 'paragraph',
          format: 'explicit',
        },
        price: priceData.price,
        priceCurrency: priceData.currency,
        availability: 'InStock',
        comparableValue: priceData.price,
      };
      entities.push(offerEntity);
    }
  }

  for (const faq of faqs) {
    const faqEntity: Entity = {
      id: uuidv4(),
      type: 'Question',
      content: `Q: ${faq.question}`,
      normalizedContent: normalizeText(`${faq.question} ${faq.answer}`),
      confidence: 0.88,
      boundingContext: `${faq.question} ${faq.answer}`,
      metadata: {
        extractedFrom: 'faq',
        intent: 'informational',
      },
      question: faq.question,
      acceptedAnswer: {
        text: faq.answer,
        '@type': 'Answer',
      },
    };
    entities.push(faqEntity);
  }

  const specMatch = markdown.match(/##\s*Especificações?\n\n\|?\s*([^|]+)\s*\|\s*([^|]+)\s*\|/i);
  if (specMatch) {
    const specEntity: Entity = {
      id: uuidv4(),
      type: 'Specification',
      content: `${specMatch[1].trim()}: ${specMatch[2].trim()}`,
      normalizedContent: normalizeText(`${specMatch[1]} ${specMatch[2]}`),
      confidence: 0.92,
      boundingContext: specMatch[0],
      metadata: {
        extractedFrom: 'table',
      },
      name: specMatch[1].trim(),
      value: specMatch[2].trim(),
      comparableValue: parseFloat(specMatch[2].replace(/[^0-9.,]/g, '').replace(',', '.')),
      category: 'technical',
    };
    entities.push(specEntity);
  }

  return entities;
}

function resolveRelationships(entities: Entity[]): Relationship[] {
  const relationships: Relationship[] = [];

  for (const entity of entities) {
    if (entity.type === 'Offer') {
      const product = entities.find(e => e.type === 'Product');
      if (product) {
        relationships.push({
          id: uuidv4(),
          source: entity.id,
          target: product.id,
          type: 'pricing',
          confidence: 0.98,
          bidirectional: true,
          metadata: {
            extractionMethod: 'contextual',
            boundingContext: 'price near product heading',
          },
        });
      }
    }

    if (entity.type === 'Question') {
      const product = entities.find(e => e.type === 'Product');
      if (product) {
        relationships.push({
          id: uuidv4(),
          source: entity.id,
          target: product.id,
          type: 'faq_about',
          confidence: 0.88,
          bidirectional: false,
          metadata: {
            extractionMethod: 'contextual',
            boundingContext: 'faq section near product',
          },
        });
      }
    }

    if (entity.type === 'Specification') {
      const product = entities.find(e => e.type === 'Product');
      if (product) {
        relationships.push({
          id: uuidv4(),
          source: entity.id,
          target: product.id,
          type: 'specification',
          confidence: 0.92,
          bidirectional: false,
          metadata: {
            extractionMethod: 'structural',
            boundingContext: 'specs section near product',
          },
        });
      }
    }
  }

  return relationships;
}

function classifyIntent(markdown: string, entities: Entity[]): IntentClassification {
  const hasPrice = entities.some(e => e.type === 'Offer');
  const hasProduct = entities.some(e => e.type === 'Product');

  let primary: 'transactional' | 'informational' | 'comparative' | 'navigational' = 'informational';
  if (hasPrice && hasProduct) {
    primary = 'transactional';
  }

  return {
    primary,
    secondary: ['informational'],
    confidence: 0.85,
    signals: {
      hasPrice,
      hasBuyIntent: hasPrice,
      isComparison: markdown.toLowerCase().includes('vs') || markdown.toLowerCase().includes('comparação'),
      isHowTo: markdown.toLowerCase().includes('como') && markdown.toLowerCase().includes('fazer'),
      isTroubleshooting: markdown.toLowerCase().includes('problema') || markdown.toLowerCase().includes('erro'),
      isProductPage: hasProduct && hasPrice,
    },
    pageType: hasProduct ? 'product' : 'blog',
  };
}

function calculateConfidence(entities: Entity[], relationships: Relationship[]): {
  overall: number;
  factors: { structureQuality: number; contentCompleteness: number; dataExtractionAccuracy: number; relationshipClarity: number };
  warnings: string[];
} {
  const warnings: string[] = [];

  let structureQuality = 0.8;
  let contentCompleteness = 0.8;
  let dataExtractionAccuracy = 0.8;
  let relationshipClarity = 0.8;

  if (entities.length === 0) {
    warnings.push('No entities extracted');
    contentCompleteness = 0.3;
  }

  if (!entities.some(e => e.type === 'Product')) {
    warnings.push('No product entity found');
    structureQuality -= 0.2;
  }

  if (!entities.some(e => e.type === 'Offer')) {
    warnings.push('No price found - may impact LLM transaction understanding');
  }

  const relationshipsWithProducts = relationships.filter(r =>
    entities.some(e => e.type === 'Product')
  );
  if (relationshipsWithProducts.length === 0) {
    warnings.push('No relationships resolved - content may be disconnected');
    relationshipClarity = 0.5;
  }

  const overall = (structureQuality + contentCompleteness + dataExtractionAccuracy + relationshipClarity) / 4;

  return {
    overall,
    factors: {
      structureQuality,
      contentCompleteness,
      dataExtractionAccuracy,
      relationshipClarity,
    },
    warnings,
  };
}

export function createParser() {
  return {
    parse: async (markdown: string, options: ParseOptions = {}): Promise<LLMContent> => {
      const {
        extractEntities = true,
        resolveRelationships = true,
        calculateConfidence = true,
        includeIntent = true,
        maxNestingDepth = 4,
        sourceUrl,
      } = options;

      const headings = extractHeadings(markdown);
      const entities = extractEntities ? extractEntities(markdown) : [];

      const relationships = resolveRelationships && extractEntities
        ? resolveRelationships(entities)
        : [];

      const intent = includeIntent && extractEntities
        ? classifyIntent(markdown, entities)
        : { primary: 'informational' as const, confidence: 0.5, signals: { hasPrice: false, hasBuyIntent: false, isComparison: false, isHowTo: false, isTroubleshooting: false, isProductPage: false }, pageType: 'blog' as const };

      const confidence = calculateConfidence && extractEntities
        ? calculateConfidence(entities, relationships)
        : { overall: 0.5, factors: { structureQuality: 0.5, contentCompleteness: 0.5, dataExtractionAccuracy: 0.5, relationshipClarity: 0.5 }, warnings: [] };

      const metadata: DocumentMetadata = {
        title: headings[0]?.text || 'Untitled',
        language: 'pt-BR',
        generatedAt: new Date().toISOString(),
        parserVersion: '0.1.0-alpha.1',
        sourceUrl,
        sourceDomain: sourceUrl ? new URL(sourceUrl).hostname : undefined,
      };

      return {
        llmseo_version: '1.0',
        metadata,
        entities,
        relationships,
        intent,
        confidence: {
          ...confidence,
          extractedAt: new Date().toISOString(),
        },
      };
    },

    validate: (markdown: string): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!markdown || markdown.trim().length === 0) {
        errors.push('Markdown is empty');
      }

      const deepNestingCount = (markdown.match(/^(\s{4,})[-*+]/gm) || []).length;
      if (deepNestingCount > 5) {
        warnings.push(`Found ${deepNestingCount} deeply nested list items - may confuse LLMs`);
      }

      const tableWithoutHeader = markdown.match(/\|[^|]+\|\s*\|\s*[-:]+[-:]/);
      if (tableWithoutHeader) {
        warnings.push('Table may be missing header row');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    },
  };
}

export type { LLMContent, ParseOptions, ValidationResult };