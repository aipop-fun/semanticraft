# Parser API Reference

API completa do `@semanticraft/parser`.

## createParser

Cria uma nova instância do parser.

```typescript
import { createParser } from '@semanticraft/parser';

const parser = createParser(options?: ParserOptions);
```

### ParserOptions

| Opção | Tipo | Default | Descrição |
|-------|------|---------|----------|
| `extractImages` | `boolean` | `true` | Extrai imagens do markdown |
| `extractCodeBlocks` | `boolean` | `true` | Extrai blocos de código |
| `extractLinks` | `boolean` | `true` | Extrai links |
| `confidenceThreshold` | `number` | `0.3` | Threshold mínimo de confiança |

## parser.parse

Executa o parsing do conteúdo markdown.

```typescript
const result = await parser.parse(markdown: string): Promise<ParseResult>
```

### ParseResult

```typescript
interface ParseResult {
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
  metadata: DocumentMetadata;
  errors: string[];
}
```

## Entity Types

### Product

```typescript
interface Product {
  id: string;
  type: 'Product';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  normalizedName: string;
  description?: string;
  image?: unknown;
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
```

### Offer

```typescript
interface Offer {
  id: string;
  type: 'Offer';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  price: number;
  priceCurrency: string;
  priceValidUntil?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  seller?: {
    name: string;
    logo?: string;
  };
  comparableValue?: number;
}
```

### Specification

```typescript
interface Specification {
  id: string;
  type: 'Specification';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  name: string;
  value: string;
  unit?: string;
  comparableValue?: number;
  category?: 'technical' | 'physical' | 'performance';
}
```

### Review

```typescript
interface Review {
  id: string;
  type: 'Review';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  rating?: number;
  author?: string;
  reviewDate?: string;
}
```

### Question

```typescript
interface Question {
  id: string;
  type: 'Question';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  answer?: string;
}
```

### Navigation

```typescript
interface Navigation {
  id: string;
  type: 'Navigation';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  url: string;
  label: string;
}
```

### CallToAction

```typescript
interface CallToAction {
  id: string;
  type: 'CallToAction';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  intent?: 'buy' | 'subscribe' | 'signup' | 'download' | 'contact';
  url?: string;
}
```

### Image

```typescript
interface Image {
  id: string;
  type: 'Image';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  alt: string;
  url?: string;
}
```

### CodeBlock

```typescript
interface CodeBlock {
  id: string;
  type: 'CodeBlock';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  language?: string;
  code: string;
}
```

### Quote

```typescript
interface Quote {
  id: string;
  type: 'Quote';
  content: string;
  normalizedContent: string;
  confidence: number;
  boundingContext: string;
  metadata: Record<string, unknown>;
  author?: string;
}
```

## Relationship Types

```typescript
interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  metadata: {
    extractionMethod: 'explicit' | 'inferred';
    boundingContext: string;
  };
}

type RelationshipType =
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
```

## Intent Classification

```typescript
interface IntentClassification {
  primary: 'transactional' | 'informational' | 'comparative' | 'navigational';
  secondary?: IntentClassification['primary'];
  confidence: number;
  signals: {
    hasPrice: boolean;
    hasBuyIntent: boolean;
    isComparison: boolean;
    isHowTo: boolean;
    isTroubleshooting: boolean;
    isProductPage: boolean;
  };
  pageType: 'product' | 'pricing' | 'comparison' | 'review' | 'blog' | 'faq' | 'landing';
}
```

## Confidence Score

```typescript
interface ConfidenceScore {
  overall: number;
  factors: {
    structureQuality: number;
    contentCompleteness: number;
    dataExtractionAccuracy: number;
    relationshipClarity: number;
  };
  warnings: string[];
  extractedAt: string;
  entityCount: {
    total: number;
    byType: Record<string, number>;
  };
}
```

## Document Metadata

```typescript
interface DocumentMetadata {
  title?: string;
  description?: string;
  url?: string;
  language?: string;
  generatedAt: string;
  parserVersion: string;
}
```

## Exemplo Completo

```typescript
import { createParser } from '@semanticraft/parser';

const parser = createParser({
  extractImages: true,
  confidenceThreshold: 0.5,
});

const markdown = `
# MacBook Pro M3

**Preço:** R$ 18.999

Tela Liquid Retina XDR de 14.2 polegadas.
Chip M3 Pro com 18GB de RAM.

## Especificações

- Processador: M3 Pro
- RAM: 18GB
- Armazenamento: 512GB SSD

## FAQ

**P: Tem porta HDMI?**
R: Sim, HDMI 2.1.
`;

const result = await parser.parse(markdown);

console.log('Entities:', result.entities.length);
console.log('Intent:', result.intent.primary);
console.log('Confidence:', result.confidence.overall);
```