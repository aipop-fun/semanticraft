import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';
import type { Entity, EntityType, BaseEntity } from './types/entities';
import type { Relationship, RelationshipType } from './types/relationships';
import type { IntentClassification } from './types/intent';
import type { DocumentMetadata } from './types/metadata';
import type { LLMContent, ParseOptions, ValidationResult } from './types/index';
import {
  extractSpecifications,
  extractReviews,
  extractCallToActions,
  extractImages,
  extractCodeBlocks,
  extractNavigation,
  extractQuotes,
} from './entities';

interface AstNode {
  type: string;
  content: string;
  map?: [number, number];
  tag?: string;
  info?: string;
  children?: AstNode[];
  attrs?: Record<string, string>;
}

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

function getSourceSlice(markdown: string, map?: [number, number]): string {
  if (!map) return '';
  const [start, end] = map;
  const lines = markdown.split('\n').slice(start, end);
  return lines.join('\n');
}

function extractFromAst(markdown: string): {
  headings: { level: number; text: string; map?: [number, number] }[];
  lists: { text: string; map?: [number, number]; ordered: boolean }[];
  faqs: { question: string; answer: string; map?: [number, number] }[];
  codeBlocks: { language: string; code: string; map?: [number, number] }[];
  paragraphs: { text: string; map?: [number, number] }[];
} {
  const md = MarkdownIt();
  const tokens = md.parse(markdown, {});

  const headings: { level: number; text: string; map?: [number, number] }[] = [];
  const lists: { text: string; map?: [number, number]; ordered: boolean }[] = [];
  const faqs: { question: string; answer: string; map?: [number, number] }[] = [];
  const codeBlocks: { language: string; code: string; map?: [number, number] }[] = [];
  const paragraphs: { text: string; map?: [number, number] }[] = [];

  let currentListItems: { text: string; map?: [number, number]; ordered: boolean }[] = [];
  let lastParagraphText = '';
  let lastParagraphMap: [number, number] | undefined;

  function flushParagraph() {
    if (lastParagraphText) {
      paragraphs.push({ text: lastParagraphText, map: lastParagraphMap });
      lastParagraphText = '';
      lastParagraphMap = undefined;
    }
  }

  function flushList() {
    for (const item of currentListItems) {
      lists.push(item);
    }
    currentListItems = [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'heading_open') {
      flushParagraph();
      flushList();
      const level = parseInt(token.tag.charAt(1), 10);
      const nextToken = tokens[i + 1];
      if (nextToken && nextToken.type === 'inline') {
        headings.push({
          level,
          text: nextToken.content,
          map: token.map,
        });
        i++;
      }
    } else if (token.type === 'paragraph_open') {
      flushParagraph();
      flushList();
      lastParagraphMap = token.map;
    } else if (token.type === 'inline') {
      const text = token.content;
      if (lastParagraphText) {
        lastParagraphText += ' ' + text;
      } else {
        lastParagraphText = text;
      }
      if (!lastParagraphMap && token.map) {
        lastParagraphMap = token.map;
      }
    } else if (token.type === 'paragraph_close') {
      flushParagraph();
    } else if (token.type === 'bullet_list_open') {
      flushParagraph();
      flushList();
    } else if (token.type === 'ordered_list_open') {
      flushParagraph();
      flushList();
    } else if (token.type === 'list_item_open') {
      const nextInline = tokens[i + 1];
      if (nextInline && nextInline.type === 'inline') {
        currentListItems.push({
          text: nextInline.content,
          map: token.map,
          ordered: token.type === 'ordered_list_open',
        });
      }
    } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
      flushList();
    } else if (token.type === 'fence') {
      flushParagraph();
      flushList();
      codeBlocks.push({
        language: token.info || '',
        code: token.content,
        map: token.map,
      });
    } else if (token.type === 'code_block') {
      flushParagraph();
      flushList();
      codeBlocks.push({
        language: token.info || '',
        code: token.content,
        map: token.map,
      });
    }
  }

  flushParagraph();
  flushList();

  for (const para of paragraphs) {
    const faqMatch = para.text.match(/\*\*[Pp]\:\*\*\s*(.+?)\s*([Rr]:\s*.+?)(?=\n\n|\n##|$)/s);
    if (faqMatch) {
      faqs.push({
        question: faqMatch[1].trim(),
        answer: faqMatch[2].replace(/^[Rr]:\s*/, '').trim(),
        map: para.map,
      });
    }
  }

  return { headings, lists, faqs, codeBlocks, paragraphs };
}

function extractAllEntities(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const { headings, lists, faqs, paragraphs } = extractFromAst(markdown);

  if (headings.length > 0 && headings[0].level === 1) {
    const productEntity: Entity = {
      id: uuidv4(),
      type: 'Product',
      content: headings[0].text,
      normalizedContent: normalizeText(headings[0].text),
      confidence: 0.95,
      boundingContext: getSourceSlice(markdown, headings[0].map) || markdown.slice(0, 200),
      metadata: {
        extractedFrom: 'heading',
        headingLevel: 1,
      },
    };
    entities.push(productEntity);
  }

  for (const para of paragraphs) {
    const priceMatch = para.text.match(/\*\*[Pp]reço:\*\*\s*(.+)/i);
    if (priceMatch) {
      const priceData = extractPrice(priceMatch[1]);
      if (priceData) {
        const offerEntity: Entity = {
          id: uuidv4(),
          type: 'Offer',
          content: priceMatch[1].trim(),
          normalizedContent: normalizeText(priceMatch[1]),
          confidence: priceData.price > 0 ? 0.98 : 0.5,
          boundingContext: getSourceSlice(markdown, para.map) || priceMatch[0],
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
  }

  for (const faq of faqs) {
    const faqEntity: Entity = {
      id: uuidv4(),
      type: 'Question',
      content: `Q: ${faq.question}`,
      normalizedContent: normalizeText(`${faq.question} ${faq.answer}`),
      confidence: 0.88,
      boundingContext: getSourceSlice(markdown, faq.map) || `${faq.question} ${faq.answer}`,
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

  for (const list of lists) {
    const specMatch = list.text.match(/^([^:]+):\s*([^|]+)$/);
    if (specMatch) {
      const specEntity: Entity = {
        id: uuidv4(),
        type: 'Specification',
        content: `${specMatch[1].trim()}: ${specMatch[2].trim()}`,
        normalizedContent: normalizeText(`${specMatch[1]} ${specMatch[2]}`),
        confidence: 0.92,
        boundingContext: getSourceSlice(markdown, list.map) || list.text,
        metadata: {
          extractedFrom: 'list',
        },
        name: specMatch[1].trim(),
        value: specMatch[2].trim(),
        comparableValue: parseFloat(specMatch[2].replace(/[^0-9.,]/g, '').replace(',', '.')),
        category: 'technical',
      };
      entities.push(specEntity);
    }
  }

  entities.push(...extractSpecifications(markdown));
  entities.push(...extractReviews(markdown));
  entities.push(...extractCallToActions(markdown));
  entities.push(...extractImages(markdown));
  entities.push(...extractCodeBlocks(markdown));
  entities.push(...extractNavigation(markdown));
  entities.push(...extractQuotes(markdown));

  return entities;
}

function generateUsageHints(relationships: Relationship[]): UsageHint[] {
  const hints: UsageHint[] = [];

  const hintMap: Record<RelationshipType, { hint: string; queryTypes: ('transactional' | 'informational' | 'comparative')[] }> = {
    hierarchical: {
      hint: 'Use when user wants to understand product categories or navigate product structure',
      queryTypes: ['informational'],
    },
    comparative: {
      hint: 'Use when user compares products or asks about differences between options',
      queryTypes: ['comparative', 'informational'],
    },
    temporal: {
      hint: 'Use when user asks about product history, availability timeline, or scheduling',
      queryTypes: ['informational'],
    },
    specification: {
      hint: 'Use when user asks about technical details, features, or product capabilities',
      queryTypes: ['informational'],
    },
    pricing: {
      hint: 'Use when user asks about price, cost, value, or purchasing options',
      queryTypes: ['transactional', 'informational'],
    },
    review_of: {
      hint: 'Use when user wants reviews, ratings, opinions, or user experiences',
      queryTypes: ['informational', 'comparative'],
    },
    faq_about: {
      hint: 'Use when user has common questions about product usage or specifications',
      queryTypes: ['informational'],
    },
    media_of: {
      hint: 'Use when user wants to see product images, videos, or visual demonstrations',
      queryTypes: ['informational'],
    },
    navigation_to: {
      hint: 'Use when user wants to navigate to related pages or additional resources',
      queryTypes: ['transactional', 'informational'],
    },
    call_to: {
      hint: 'Use when user intends to purchase, sign up, or take action on the product',
      queryTypes: ['transactional'],
    },
    related: {
      hint: 'Use for general related content that does not fit specific relationship types',
      queryTypes: ['informational'],
    },
    same_as: {
      hint: 'Use when user refers to the same product by different names',
      queryTypes: ['informational', 'transactional'],
    },
  };

  for (const rel of relationships) {
    const hintTemplate = hintMap[rel.type];
    if (hintTemplate) {
      hints.push({
        relationship: rel.id,
        hint: hintTemplate.hint,
        queryTypes: hintTemplate.queryTypes,
      });
    }
  }

  return hints;
}

function resolveEntityRelationships(entities: Entity[], markdown: string = ''): Relationship[] {
  const relationships: Relationship[] = [];
  const normalizedMarkdown = markdown.toLowerCase();

  const products = entities.filter(e => e.type === 'Product');
  const offers = entities.filter(e => e.type === 'Offer');
  const questions = entities.filter(e => e.type === 'Question');
  const specifications = entities.filter(e => e.type === 'Specification');
  const images = entities.filter(e => e.type === 'Image');
  const navigations = entities.filter(e => e.type === 'Navigation');
  const ctas = entities.filter(e => e.type === 'CallToAction');

  for (const offer of offers) {
    const product = products[0];
    if (product) {
      relationships.push({
        id: uuidv4(),
        source: offer.id,
        target: product.id,
        type: 'pricing',
        confidence: 0.98,
        bidirectional: true,
        metadata: {
          extractionMethod: 'explicit',
          boundingContext: 'price section near product heading',
        },
      });
    }
  }

  for (const question of questions) {
    const product = products[0];
    if (product) {
      relationships.push({
        id: uuidv4(),
        source: question.id,
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

  for (const spec of specifications) {
    const product = products[0];
    if (product) {
      relationships.push({
        id: uuidv4(),
        source: spec.id,
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

  const comparisonKeywords = ['vs', 'versus', 'comparado a', 'comparada a', 'melhor que', 'pior que'];
  const hasComparison = comparisonKeywords.some(kw => normalizedMarkdown.includes(kw));
  if (hasComparison && products.length >= 2) {
    relationships.push({
      id: uuidv4(),
      source: products[0].id,
      target: products[1].id,
      type: 'comparative',
      confidence: 0.85,
      bidirectional: true,
      metadata: {
        extractionMethod: 'inferred',
        boundingContext: 'comparison keywords detected in content',
      },
    });
  }

  const temporalKeywords = ['antes de', 'depois de', 'desde', 'até', 'durante', 'quando'];
  const hasTemporal = temporalKeywords.some(kw => normalizedMarkdown.includes(kw));
  if (hasTemporal && products.length >= 1) {
    relationships.push({
      id: uuidv4(),
      source: products[0].id,
      target: products[0].id,
      type: 'temporal',
      confidence: 0.75,
      bidirectional: false,
      metadata: {
        extractionMethod: 'inferred',
        boundingContext: 'temporal keywords detected in content',
      },
    });
  }

  const reviewKeywords = ['review', 'avaliação', 'análise', 'opinião', 'nota'];
  const hasReviewKeyword = reviewKeywords.some(kw => normalizedMarkdown.includes(kw));
  if (hasReviewKeyword && products.length >= 1) {
    relationships.push({
      id: uuidv4(),
      source: products[0].id,
      target: products[0].id,
      type: 'review_of',
      confidence: 0.87,
      bidirectional: false,
      metadata: {
        extractionMethod: 'inferred',
        boundingContext: 'review keywords detected near product',
      },
    });
  }

  for (const image of images) {
    const product = products[0];
    if (product) {
      relationships.push({
        id: uuidv4(),
        source: image.id,
        target: product.id,
        type: 'media_of',
        confidence: 0.90,
        bidirectional: false,
        metadata: {
          extractionMethod: 'contextual',
          boundingContext: image.boundingContext,
        },
      });
    }
  }

  const links = markdown.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  if (links.length > 0 && products.length >= 1) {
    const product = products[0];
    for (const link of links.slice(0, 5)) {
      relationships.push({
        id: uuidv4(),
        source: product.id,
        target: uuidv4(),
        type: 'navigation_to',
        confidence: 0.82,
        bidirectional: false,
        metadata: {
          extractionMethod: 'contextual',
          boundingContext: link,
        },
      });
    }
  }

  for (let i = 0; i < navigations.length; i++) {
    if (i > 0) {
      relationships.push({
        id: uuidv4(),
        source: navigations[i - 1].id,
        target: navigations[i].id,
        type: 'navigation_to',
        confidence: 0.85,
        bidirectional: false,
        metadata: {
          extractionMethod: 'structural',
          boundingContext: 'sequential navigation links',
        },
      });
    }
  }

  for (const cta of ctas) {
    const product = products[0];
    if (product) {
      relationships.push({
        id: uuidv4(),
        source: cta.id,
        target: product.id,
        type: 'call_to',
        confidence: 0.87,
        bidirectional: false,
        metadata: {
          extractionMethod: 'explicit',
          boundingContext: cta.boundingContext,
        },
      });
    }
  }

  const ctaKeywords = ['comprar', 'assinar', 'cadastrar', 'download', 'baixe', 'experimente'];
  const hasCTAKeyword = ctaKeywords.some(kw => normalizedMarkdown.includes(kw));
  if (hasCTAKeyword && !ctas.length && products.length >= 1) {
    const buyButtons = markdown.match(/\[([^\]]*(?:comprar|assinar|obter)[^\]]*)\]/gi);
    if (buyButtons && buyButtons.length > 0) {
      relationships.push({
        id: uuidv4(),
        source: uuidv4(),
        target: products[0].id,
        type: 'call_to',
        confidence: 0.78,
        bidirectional: false,
        metadata: {
          extractionMethod: 'inferred',
          boundingContext: buyButtons.join(', '),
        },
      });
    }
  }

  return relationships;
}

function calcConfidence(entities: Entity[], relationships: Relationship[]): {
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

      const { headings } = extractFromAst(markdown);
      const entities = extractEntities ? extractAllEntities(markdown) : [];

      const doResolveRelationships = resolveRelationships && extractEntities;
      const relationships = doResolveRelationships
        ? resolveEntityRelationships(entities, markdown)
        : [];

      const intent = includeIntent && extractEntities
        ? (() => {
          const hasPrice = entities.some(e => e.type === 'Offer');
          const hasProduct = entities.some(e => e.type === 'Product');
          return {
            primary: (hasPrice && hasProduct ? 'transactional' : 'informational') as IntentClassification['primary'],
            secondary: ['informational'] as IntentClassification['secondary'],
            confidence: 0.85,
            signals: {
              hasPrice,
              hasBuyIntent: hasPrice,
              isComparison: markdown.toLowerCase().includes('vs') || markdown.toLowerCase().includes('comparação'),
              isHowTo: markdown.toLowerCase().includes('como') && markdown.toLowerCase().includes('fazer'),
              isTroubleshooting: markdown.toLowerCase().includes('problema') || markdown.toLowerCase().includes('erro'),
              isProductPage: hasProduct && hasPrice,
            },
            pageType: (hasProduct ? 'product' : 'blog') as IntentClassification['pageType'],
          };
        })()
        : { primary: 'informational' as const, secondary: ['informational'] as const, confidence: 0.5, signals: { hasPrice: false, hasBuyIntent: false, isComparison: false, isHowTo: false, isTroubleshooting: false, isProductPage: false }, pageType: 'blog' as const };

      const doCalculateConfidence = calculateConfidence && extractEntities;
      const confidence = doCalculateConfidence
        ? calcConfidence(entities, relationships)
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
        usageHints: doResolveRelationships ? generateUsageHints(relationships) : [],
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

      const md = MarkdownIt();
      const tokens = md.parse(markdown, {});

      let nestingLevel = 0;
      let maxNestingLevel = 0;

      for (const token of tokens) {
        if (token.type === 'list_item_open') {
          nestingLevel++;
          if (nestingLevel > maxNestingLevel) maxNestingLevel = nestingLevel;
        } else if (token.type === 'list_item_close') {
          nestingLevel--;
        }
      }

      if (maxNestingLevel > 4) {
        warnings.push(`Found ${maxNestingLevel} deeply nested list items - may confuse LLMs`);
      }

      let foundTable = false;
      let tableMissingHeader = false;

      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'table_open') {
          foundTable = true;
          const nextToken = tokens[i + 1];
          if (nextToken && nextToken.type === 'tbody_open') {
            const tbodyContent = tokens[i + 2];
            if (tbodyContent && tbodyContent.type === 'tr_close') {
              const rowTokens = tokens.slice(i + 2, i + 4);
              const cellCount = rowTokens.filter(t => t.type === 'th_open' || t.type === 'td_open').length;
              if (cellCount === 0) {
                tableMissingHeader = true;
              }
            }
          }
        }
      }

      if (foundTable && tableMissingHeader) {
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