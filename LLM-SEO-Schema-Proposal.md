# Proposal: Schema JSON Otimizado para LLMs — "LLM-SEO Schema"

**Versão:** 1.0
**Data:** 2025-05-15
**Autor:** Schema-Architect (cell-4vouj7-mp72orwxhr6)

---

## 1. Visão Geral

Este documento propõe um schema JSON otimizado para consumo por Large Language Models (LLMs). O objetivo é criar um formato de dados estruturados que maximize a capacidade dos LLMs de entender,reasonar e responder perguntas sobre conteúdo de sites — comumente chamado de "SEO para LLMs" ou "LLM-native content".

### Problema Atual

- Markdown de sites contém informação valiosa mas em formato desestruturado
- LLMs têm dificuldade em extrair entidades e relacionamentos de texto corrido
- JSON-LD schema.org é bom mas não otimizado para padrões de inference de LLMs
- Falta metadata sobre intent, contexto e confiança dos dados extraídos

### Solução Proposta

Um schema JSON que:
1. Preserva relacionamentos explícitos entre entidades
2. Inclui hints de intent para guiar interpretação do LLM
3. Fornece contexto suficiente para evitar ambiguidades
4. Implementa confidence scores para dados de extração
5. Segue padrões familiares (JSON-LD) com extensões LLM-specific

---

## 2. Schema JSON Completo

### 2.1 Estrutura Raiz

```typescript
interface LLMContent {
  // Meta-informação sobre o documento
  metadata: DocumentMetadata;

  // Entidades extraídas do conteúdo
  entities: Entity[];

  // Relacionamentos entre entidades
  relationships: Relationship[];

  // Conteúdo original preservado para referência
  rawContent: RawContent;

  // Seções estruturadas do documento
  sections: Section[];

  // FAQ extraído
  faqs: FAQ[];

  // Reviews/avaliações
  reviews: Review[];

  // Dados tabulares (especificações, tabelas de preço)
  dataTables: DataTable[];
}

interface DocumentMetadata {
  // Identificação
  sourceUrl: string;
  sourceDomain: string;
  extractedAt: string; // ISO 8601
  contentHash: string; // SHA-256 do markdown original

  // Classificação de intent (o que o LLM deve FAZER com isso)
  primaryIntent: Intent;
  secondaryIntents: Intent[];

  // Contexto para interpretação
  contentType: ContentType; // 'product' | 'service' | 'blog' | 'pricing' | etc.
  industry: string; // "e-commerce", "saúde", "fintech"
  targetAudience: string; // "B2B", "B2C", "desenvolvedores"

  // Qualidade do conteúdo
  overallConfidence: number; // 0.0 - 1.0
  extractionVersion: string; // versão do parser
}

type Intent =
  | 'informational'      // O usuário quer SABER algo
  | 'transactional'     // O usuário quer COMPRAR/Fazer algo
  | 'comparative'        // O usuário quer COMPARAR opções
  | 'troubleshooting'    // O usuário quer RESOLVER um problema
  | 'research'           // O usuário quer AVALIAR/Investigar
  | 'navigational'       // O usuário quer ENCONTRAR algo específico
  | 'support'            // O usuário quer AJUDA/Custommer service
  | 'educational';       // O usuário quer APRENDER

type ContentType =
  | 'product' | 'service' | 'pricing' | 'blog'
  | 'documentation' | 'faq' | 'review' | 'comparison'
  | 'landing_page' | 'checkout' | 'contact' | 'about';
```

### 2.2 Sistema de Entidades

```typescript
// Base para todas as entidades
interface Entity {
  // Identificação única
  id: string; // ex: "prod_123", "svc_456"
  type: EntityType;
  name: string;

  // Hints para LLM
  entityIntent: Intent[]; // Como esta entidade é tipicamente usada
  entityContext: string; // Descrição textual para desambiguação

  // Localização no conteúdo original
  sourceLocations: SourceLocation[];

  // Confiança na extração
  confidence: ConfidenceScore;

  // Dados específicos por tipo
  attributes: Record<string, any>;
}

// Tipos de entidades principais
type EntityType =
  // Produtos
  | 'Product'
  | 'ProductVariant'
  | 'ProductCategory'
  | 'Brand'
  | 'Manufacturer'

  // Serviços
  | 'Service'
  | 'ServicePlan'
  | 'ServiceProvider'

  // Preços
  | 'Price'
  | 'Discount'
  | 'Promocode'
  | 'SubscriptionTier'

  // Especificações
  | 'Specification'
  | 'SpecificationGroup'
  | 'TechnicalFeature'

  // Reviews
  | 'Review'
  | 'Reviewer'
  | 'Rating'

  // FAQ
  | 'Question'
  | 'Answer'

  // Empresa/Pessoa
  | 'Organization'
  | 'Person'
  | 'Location'

  // Conteúdo
  | 'FAQ'
  | 'HowTo'
  | 'Tutorial'
  | 'ComparisonTable';

interface ConfidenceScore {
  score: number; // 0.0 - 1.0
  factors: ConfidenceFactor[];
  lastVerified: string; // ISO 8601
}

interface ConfidenceFactor {
  type: 'extraction_method' | 'content_clarity' | 'source_reliability' | 'contradiction_detected';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number; // 0.0 - 1.0
}

interface SourceLocation {
  // Onde no markdown original esta entidade aparece
  sectionId?: string;
  lineStart: number;
  lineEnd: number;
  paragraphIndex: number;
  xpath?: string; // XPath do elemento HTML se disponível
}
```

### 2.3 Sistema de Relacionamentos

```typescript
interface Relationship {
  id: string;

  // Entidades envolvidas
  fromEntity: string; // Entity ID
  toEntity: string;   // Entity ID

  // Tipo do relacionamento (inspirado em schema.org + extensões)
  relationshipType: RelationshipType;

  // Confiança no relacionamento
  confidence: number; // 0.0 - 1.0

  // Contexto para o LLM entender o relacionamento
  description: string; // Ex: "iPhone 15 Pro tem tela de 6.1 polegadas"

  // Hints de como usar este relacionamento
  usageHints: string[]; // Ex: ["comparar_telas", "validar_specs"]

  // Dados adicionais do relacionamento
  attributes: Record<string, any>;
}

type RelationshipType =
  // Hierárquicos (tem-a / parte-de)
  | 'has_product' | 'has_variant' | 'has_specification' | 'has_price'
  | 'has_feature' | 'has_review' | 'has_faq' | 'has_option'
  | 'part_of_category' | 'part_of_family' | 'part_of_bundle'

  // Qualidades (é-a / tem-propriedade)
  | 'is_a' | 'has_brand' | 'has_manufacturer' | 'has_model'
  | 'has_weight' | 'has_dimensions' | 'has_color' | 'has_material'

  // Comparativos
  | 'compares_to' | 'competes_with' | 'similar_to' | 'alternativa_to'

  // Temporais
  | 'released_on' | 'discontinued_on' | 'updated_on' | 'valid_from' | 'valid_until'

  // Preço
  | 'costs' | 'discounted_by' | 'includes' | 'requires' | 'available_at'

  // Avaliações
  | 'rated_by' | 'reviewer_of' | 'rates' | 'average_rating_of'

  // FAQ/Suporte
  | 'answers' | 'related_to' | 'solves' | 'causes';
```

### 2.4 Produtos e Especificações

```typescript
interface Product extends Entity {
  type: 'Product';

  attributes: {
    // Identificação
    sku?: string;
    ean?: string;
    gtin?: string;
    mpn?: string; // Manufacturer Part Number

    // Nome e descrição
    name: string;
    shortDescription?: string;
    fullDescription?: string;
    slug?: string;

    // Categorização
    categories: CategoryPath[]; // [["Eletrônicos", "Celulares", "iPhone"]]

    // Imagens
    images: ProductImage[];

    // Preço (referência ao entity de Price)
    priceEntityId?: string; // Relacionamento

    // Disponibilidade
    availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'discontinued';
    stockQuantity?: number;

    // Marca e fabricante (referências)
    brandEntityId?: string;
    manufacturerEntityId?: string;

    // Especificações técnicas (grupo de specs)
    specificationGroups: SpecificationGroup[];

    // Variantes (referências a ProductVariant)
    variantEntityIds?: string[];

    // Reviews agregados (referência)
    aggregateReviewEntityId?: string;

    // Links externos
    urls?: {
      productPage?: string;
      buyPage?: string;
      supportPage?: string;
    };
  };
}

interface ProductVariant extends Entity {
  type: 'ProductVariant';

  attributes: {
    parentProductEntityId: string; // Reference to Product

    // Diferenças da variante
    variantOf: string; // ex: "Cor", "Tamanho", "Capacidade"
    variantValue: string; // ex: "Preto", "256GB"

    // Atributos que sobrescrevem o produto pai
    overrides?: Partial<Product['attributes']>;

    // Preço específico da variante (se diferente)
    priceEntityId?: string;
  };
}

interface SpecificationGroup {
  name: string; // ex: "Especificações Técnicas", "Conteúdo da Caixa"
  specifications: Specification[];
}

interface Specification {
  name: string; // ex: "Tamanho da tela"
  value: string | number; // ex: "6.1 polegadas"
  unit?: string; // ex: "polegadas", "GB", "mAh"
  rawValue?: string; // Valor original antes de parsing

  // Para comparação
  comparableValue?: number | string; // Valor normalizado para ordenação
  comparableUnit?: string;

  // Confiança
  confidence: number;
}

interface ProductImage {
  url: string;
  altText?: string;
  isPrimary: boolean;
  resolution?: string; // "1200x1200"
}

interface CategoryPath {
  path: string[]; // ["Eletrônicos", "Celulares", "Smartphones"]
  url?: string;
}
```

### 2.5 Preços e Planos

```typescript
interface Price extends Entity {
  type: 'Price';

  attributes: {
    // Valor
    amount: number;
    currency: string; // ISO 4217, ex: "BRL", "USD"

    // Tipo de preço
    priceType: 'final' | 'original' | 'starting' | 'range' | 'per_unit';
    priceRange?: {
      min: number;
      max: number;
    };

    // Contexto
    appliesToEntityId?: string; // Produto, variante, serviço
    appliesToVariantValue?: string; // Se é preço de variante específica

    // Validade
    validFrom?: string;
    validUntil?: string;
    isCurrent: boolean;

    // Desconto associado
    discountEntityId?: string;

    // Condições
    conditions?: string; // "para membros Prime", "no Pix"
    installmentOptions?: {
      months: number;
      monthlyPayment: number;
      interestRate: number;
    };
  };
}

interface SubscriptionTier extends Entity {
  type: 'SubscriptionTier';

  attributes: {
    planName: string;
    billingPeriod: 'monthly' | 'yearly' | 'weekly' | 'lifetime';
    priceEntityId: string;

    features: TierFeature[];
    limitations?: string[];

    isPopular?: boolean;
    isBestValue?: boolean;
  };
}

interface TierFeature {
  name: string;
  included: boolean;
  limit?: string; // "1000 requests/mês"
  note?: string;
}

interface Discount extends Entity {
  type: 'Discount';

  attributes: {
    type: 'percentage' | 'fixed_amount' | 'bundle' | 'free_shipping' | 'bogo';
    value: number; // Ex: 10 para 10% ou 10 para R$10

    code?: string; // Código do cupom

    // Aplicabilidade
    appliesToEntityIds?: string[]; // Produtos específicos
    appliesToCategoryPaths?: string[][];
    minimumPurchase?: number;

    // Validade
    validFrom?: string;
    validUntil?: string;

    //Condições
    conditions?: string;
  };
}
```

### 2.6 Reviews e Avaliações

```typescript
interface Review extends Entity {
  type: 'Review';

  attributes: {
    // Reviewer
    reviewerName: string;
    reviewerIsVerified: boolean;
    reviewerLocation?: string;
    reviewerTrustScore?: number; // 0-100

    // Rating
    ratingValue: number; // tipicamente 1-5
    ratingBestValue: number; // tipicamente 5
    ratingAspect?: string; // "bateria", "câmera" - para reviews aspect-specific

    // Conteúdo
    title?: string;
    content: string;
    pros?: string[];
    cons?: string[];

    // Contexto
    subjectEntityId: string; // Produto sendo avaliado
    usageContext?: string; // "Uso diário", "Para trabalho"

    // Datas
    reviewDate: string;
    verifiedPurchase: boolean;
    helpfulCount?: number;

    // Médias
    aggregateRatings?: AggregateRating;
  };
}

interface AggregateRating extends Entity {
  type: 'AggregateRating';

  attributes: {
    itemReviewedEntityId: string;

    ratingCount: number; // Total de reviews
    reviewCount: number; // Count com texto
    ratingDistribution: {
      [value: number]: number; // {5: 120, 4: 45, 3: 20, 2: 8, 1: 7}
    };

    averageRating: number;
    medianRating?: number;
    ratingSummary?: string; // "4.5 de 5 estrelas (200 avaliações)"

    bestRating: number;
    worstRating: number;
  };
}
```

### 2.7 FAQ e Suporte

```typescript
interface FAQ extends Entity {
  type: 'FAQ';

  attributes: {
    questions: QAPair[];
    category?: string;
  };
}

interface QAPair {
  question: string;
  answer: string;

  // Qualidade
  confidence: number;

  // Tipo de answer
  answerType?: 'factual' | 'instructional' | 'opinion' | 'troubleshooting';

  // FAQ relacionados
  relatedQuestionIds?: string[];

  // Links para recursos externos
    relatedLinks?: {
      text: string;
      url: string;
    }[];
}
```

### 2.8 Seções e Raw Content

```typescript
interface Section {
  id: string;
  type: SectionType;

  // Hierarquia
  level: number; // 1 = h1, 2 = h2, etc.
  parentSectionId?: string;
  childSectionIds?: string[];

  // Conteúdo
  heading: string;
  content: string; // Texto do markdown já processado

  // Entidades nesta seção
  entityIds: string[];

  // Se é uma tabela de dados
  tableData?: DataTable;

  // Confiança
  confidence: number;
}

type SectionType =
  | 'hero'
  | 'features'
  | 'specifications'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'comparison'
  | 'how_to'
  | 'contact'
  | 'footer'
  | 'navigation'
  | 'other';

interface RawContent {
  // Markdown original
  markdown: string;

  // HTML original (se disponível)
  html?: string;

  // Metadados do parsing
  parsingMetadata: {
    parserVersion: string;
    parseTime: number; // ms
    contentHash: string;
    lineCount: number;
  };
}

interface DataTable {
  headers: string[];
  rows: Record<string, string | number>[];

  // Tipo de dados na tabela
  tableType?: 'specifications' | 'pricing' | 'comparison' | 'schedule' | 'other';

  // entities referenciadas
  referencedEntityIds: string[];

  // cells com anotações LLM
  cellAnnotations?: {
    [rowIndex: number]: {
      [colIndex: number]: {
        intent?: Intent;
        dataType?: 'string' | 'number' | 'currency' | 'date' | 'boolean';
        extractedValue?: any;
        confidence: number;
      };
    };
  };
}
```

---

## 3. Exemplos de Input → Output

### 3.1 Input: Markdown de Produto Bagunçado

```markdown
# iPhone 15 Pro Max 256GB Titanio Natural

**SKU:** APL-MU6A3BE/A | **EAN:** 194253401459

O iPhone 15 Pro Max tem tela Super Retina XDR de 6.7 polegadas
sempre ativa com ProMotion eDynamic Island.

**Preço: R$ 10.499,00** ou até 12x de R$ 874,92 sem juros

✓ Tela 6.7" Super Retina XDR
✓ Chip A17 Pro
✓ Câmera Tripla 48MP + 12MP + 12MP
✓ 8GB RAM | 256GB armazenamento
✓ Bateria 4422 mAh
✓ USB-C com USB 3

Câmera:
- Principal: 48 MP, f/1.78
- Ultra-wide: 12 MP, f/2.2
- Teleobjetiva: 12 MP, 5x zoom óptico

Disponível em: 256GB, 512GB, 1TB
Cores: Titânio Natural, Titânio Azul, Titânio Branco, Titânio Preto
```

### 3.2 Output: Schema Proposto

```json
{
  "metadata": {
    "sourceUrl": "https://loja.apple.com/iphone-15-pro",
    "sourceDomain": "loja.apple.com",
    "extractedAt": "2025-05-15T10:30:00Z",
    "contentHash": "sha256:abc123...",
    "primaryIntent": "transactional",
    "secondaryIntents": ["comparative", "research"],
    "contentType": "product",
    "industry": "e-commerce",
    "targetAudience": "B2C",
    "overallConfidence": 0.92,
    "extractionVersion": "1.0.0"
  },

  "entities": [
    {
      "id": "prod_iphone15promax",
      "type": "Product",
      "name": "iPhone 15 Pro Max 256GB Titânio Natural",
      "entityIntent": ["transactional", "comparative"],
      "entityContext": "Smartphone premium da Apple lançado em 2023, successor do iPhone 14 Pro Max",
      "confidence": {
        "score": 0.95,
        "factors": [
          {
            "type": "content_clarity",
            "impact": "positive",
            "description": "Nome do produto claro com especificações completas",
            "weight": 0.4
          }
        ],
        "lastVerified": "2025-05-15T10:30:00Z"
      },
      "attributes": {
        "sku": "APL-MU6A3BE/A",
        "ean": "194253401459",
        "name": "iPhone 15 Pro Max 256GB Titânio Natural",
        "shortDescription": "Smartphone premium com Dynamic Island e câmera de 48MP",
        "categories": [["Eletrônicos", "Celulares", "iPhone", "iPhone 15 Pro Max"]],
        "images": [
          {
            "url": "https://store.apple.com/iphone15promax.jpg",
            "altText": "iPhone 15 Pro Max Titânio Natural",
            "isPrimary": true
          }
        ],
        "availability": "in_stock",
        "brandEntityId": "brand_apple",
        "manufacturerEntityId": "org_apple",
        "specificationGroups": [
          {
            "name": "Tela",
            "specifications": [
              {
                "name": "Tamanho",
                "value": "6.7 polegadas",
                "unit": "polegadas",
                "comparableValue": 6.7,
                "comparableUnit": "polegadas",
                "confidence": 0.98
              },
              {
                "name": "Tipo",
                "value": "Super Retina XDR com ProMotion",
                "confidence": 0.98
              },
              {
                "name": "Dynamic Island",
                "value": "Sim",
                "dataType": "boolean",
                "confidence": 0.99
              }
            ]
          },
          {
            "name": "Câmera",
            "specifications": [
              {
                "name": "Principal",
                "value": "48 MP, f/1.78",
                "confidence": 0.97
              },
              {
                "name": "Ultra-wide",
                "value": "12 MP, f/2.2",
                "confidence": 0.97
              },
              {
                "name": "Teleobjetiva",
                "value": "12 MP, 5x zoom óptico",
                "confidence": 0.97
              }
            ]
          },
          {
            "name": "Desempenho",
            "specifications": [
              {
                "name": "Processador",
                "value": "A17 Pro",
                "confidence": 0.99
              },
              {
                "name": "RAM",
                "value": "8 GB",
                "unit": "GB",
                "comparableValue": 8,
                "confidence": 0.95
              },
              {
                "name": "Armazenamento",
                "value": "256 GB",
                "unit": "GB",
                "comparableValue": 256,
                "confidence": 0.98
              }
            ]
          },
          {
            "name": "Bateria",
            "specifications": [
              {
                "name": "Capacidade",
                "value": "4422 mAh",
                "unit": "mAh",
                "comparableValue": 4422,
                "confidence": 0.92
              }
            ]
          }
        ],
        "variantOptions": {
          "storage": ["256GB", "512GB", "1TB"],
          "color": ["Titânio Natural", "Titânio Azul", "Titânio Branco", "Titânio Preto"]
        }
      }
    },
    {
      "id": "price_iphone15promax_256gb",
      "type": "Price",
      "name": "Preço iPhone 15 Pro Max 256GB",
      "entityIntent": ["transactional"],
      "entityContext": "Preço oficial loja Apple Brasil",
      "confidence": { "score": 0.99, "factors": [], "lastVerified": "2025-05-15T10:30:00Z" },
      "attributes": {
        "amount": 10499.00,
        "currency": "BRL",
        "priceType": "final",
        "appliesToEntityId": "prod_iphone15promax",
        "appliesToVariantValue": "256GB",
        "validFrom": null,
        "validUntil": null,
        "isCurrent": true,
        "installmentOptions": {
          "months": 12,
          "monthlyPayment": 874.92,
          "interestRate": 0
        }
      }
    },
    {
      "id": "brand_apple",
      "type": "Brand",
      "name": "Apple",
      "entityIntent": ["informational", "research"],
      "entityContext": "Empresa americana de tecnologia, fabricante do iPhone",
      "confidence": { "score": 0.99, "factors": [], "lastVerified": "2025-05-15T10:30:00Z" },
      "attributes": {}
    },
    {
      "id": "org_apple",
      "type": "Organization",
      "name": "Apple Inc.",
      "entityIntent": ["informational"],
      "entityContext": "Apple Inc., Cupertino, California",
      "confidence": { "score": 0.99, "factors": [], "lastVerified": "2025-05-15T10:30:00Z" },
      "attributes": {
        "url": "https://www.apple.com",
        "location": "Cupertino, California, USA"
      }
    }
  ],

  "relationships": [
    {
      "id": "rel_1",
      "fromEntity": "prod_iphone15promax",
      "toEntity": "price_iphone15promax_256gb",
      "relationshipType": "costs",
      "confidence": 0.99,
      "description": "iPhone 15 Pro Max 256GB custa R$ 10.499,00",
      "usageHints": ["mostrar_preco", "calcular_total"]
    },
    {
      "id": "rel_2",
      "fromEntity": "prod_iphone15promax",
      "toEntity": "brand_apple",
      "relationshipType": "has_brand",
      "confidence": 0.99,
      "description": "iPhone 15 Pro Max é da marca Apple",
      "usageHints": ["filtrar_marca", "pesquisar_fabricante"]
    },
    {
      "id": "rel_3",
      "fromEntity": "prod_iphone15promax",
      "toEntity": "org_apple",
      "relationshipType": "has_manufacturer",
      "confidence": 0.99,
      "description": "Fabricado por Apple Inc.",
      "usageHints": ["informacoes_fabricante"]
    }
  ],

  "sections": [
    {
      "id": "sec_hero",
      "type": "hero",
      "level": 1,
      "heading": "iPhone 15 Pro Max 256GB Titanio Natural",
      "content": "Smartphone premium com Dynamic Island e câmera de 48MP",
      "entityIds": ["prod_iphone15promax", "price_iphone15promax_256gb"],
      "confidence": 0.95
    }
  ],

  "faqs": [],
  "reviews": [],

  "dataTables": []
}
```

---

## 4. Decisões de Design e Rationale

### 4.1 Por que não usar apenas JSON-LD?

| Aspecto | JSON-LD | LLM-SEO Schema |
|---------|---------|----------------|
| Entidades | Apenas tipos schema.org | Qualquer entidade com ID único |
| Relacionamentos | Predicados fixos (schema.org) | Predicados custom + context |
| Intent | Não suporta | Campo `intent` nativo |
| Confiança | Não suporta | `confidence.score` com fatores |
| Location | Não suporta | `sourceLocation` para cite-ability |
| Comparabilidade | Nenhum mecanismo | `comparableValue` para ordenação |

### 4.2 Sistema de Intent

A presença de `intent` permite que LLMs saibam como responder:

```json
{
  "primaryIntent": "transactional",
  "secondaryIntents": ["comparative"]
}
```

**Por quê?** Quando um usuário pergunta "qual iPhone comprar?", o LLM pode:
1. Identificar intent=transactional → focus em preço/disponibilidade
2. Identificar intent=comparative → oferecer comparações com alternatives

### 4.3 Confidence Score com Fatores

Simples `0.95` não ajuda a entender PROBLEMAS. Decomposição:

```json
{
  "score": 0.72,
  "factors": [
    {
      "type": "contradiction_detected",
      "impact": "negative",
      "description": "Preço diferente em duas seções: R$10.499 vs R$9.999",
      "weight": 0.5
    },
    {
      "type": "content_clarity",
      "impact": "positive",
      "description": "Especificações bem formatadas",
      "weight": 0.3
    }
  ]
}
```

**Benefício:** LLMs podem EXPLAINar porque não tem certeza, ou pedir CLARIFICATION.

### 4.4 Relacionamentos com Hints

```json
{
  "relationshipType": "has_specification",
  "description": "iPhone 15 Pro Max tem tela de 6.7 polegadas",
  "usageHints": ["comparar_telas", "validar_specs", "filtrar_por_tamanho"]
}
```

**Por quê?** O mesmo dado tem múltiplos usos. `usageHints` guia o LLM sobre QUANDO usar este relacionamento.

### 4.5 comparableValue para Ordenação

```json
{
  "name": "Tamanho da tela",
  "value": "6.7 polegadas",
  "comparableValue": 6.7,
  "comparableUnit": "polegadas"
}
```

**Benefício:** LLMs podem fazer sorting/filtering sem entender strings "6.7 polegadas" vs "6.1 polegadas".

---

## 5. Casos de Uso para LLMs

### 5.1 Query: "Qual o iPhone mais barato com câmera 48MP?"

**Sem schema:** LLM precisa parsear texto e inferir que câmera 48MP = iPhone 15 Pro/Pro Max.

**Com schema:**
```json
// Query passa a ter contexto estruturado
{
  "queryIntent": "transactional",
  "filters": {
    "hasSpec": {"name": "Câmera Principal", "value": "48 MP"},
    "maxPrice": 8000
  },
  "sortBy": "price"
}

// LLM pode:
// 1. Filtrar entities onde specificationGroups contém {name: "Câmera Principal", value: "48 MP"}
// 2. Ordenar por Price.amount ASC
// 3. Retornar resultado estruturado
```

### 5.2 Query: "Me ajude a escolher entre iPhone 15 Pro e Samsung S24 Ultra"

**Input para LLM:**
```json
{
  "entities": ["prod_iphone15pro", "prod_samsungs24ultra"],
  "relationships": [
    {"fromEntity": "prod_iphone15pro", "toEntity": "spec_screen", "relationshipType": "has_specification"},
    {"fromEntity": "prod_samsungs24ultra", "toEntity": "spec_screen", "relationshipType": "has_specification"}
  ],
  "compareOn": ["screen_size", "camera", "battery", "price"]
}
```

**Benefício:** LLM tem FACTS estruturados para comparison, não precisa inferir de texto.

---

## 6. Próximos Passos para Implementação

### Fase 1: Parser Core (Semana 1-2)
- [ ] Implementar modelo de dados TypeScript
- [ ] Criar parser Markdown → AST
- [ ] Extrair entidades básicas (produto, preço, título)
- [ ] Gerar JSON no schema proposto

### Fase 2: Relaciamentos (Semana 3-4)
- [ ] Implementar resolução de entidades
- [ ] Detectar relacionamentos (has_brand, has_specification, etc.)
- [ ] Popular `usageHints` automaticamente via regras

### Fase 3: Inteligência LLM (Semana 5-6)
- [ ] Adicionar confidence scoring com fatores
- [ ] Detectar contradições entre seções
- [ ] Implementar intent classification
- [ ] Gerar comparableValues automaticamente

### Fase 4: Validação e Otimização (Semana 7-8)
- [ ] Benchmark: precisão de extração vs baseline
- [ ] Testar queries LLM com dataset extraído
- [ ] Iterar no schema baseado em resultados

### Prioridades Técnicas:
1. **Parser**: Markdown-it ou remark para parsing
2. **NER**: spaCy ou similar para extração de entidades
3. **LLM**: GPT-4 ou Claude para intent classification e confidence scoring
4. **Storage**: PostgreSQL com JSONB para queries eficientes

---

## 7. Considerações Finais

O schema proposto oferece:

1. **Compatibilidade**: Baseado em JSON-LD/schema.org para familiaridade
2. **Extensibilidade**: Novos tipos de entidade podem ser adicionados
3. **LLM-Native**: Campos específicos (intent, context, confidence) guiam inference
4. **Cite-ability**: sourceLocations permitem verificar fatos no original
5. **Comparabilidade**: comparableValues permitem ordenação/filtering

**Próximo passo imediato:** Implementar protótipo com produto Apple e validar extração.

---

*Documento gerado por Schema-Architect (cell-4vouj7-mp72orwxhr6)*
*Para implementação, consultar SPEC.md com detalhamento técnico completo*
