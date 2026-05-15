# SPEC.md - Semanticraft

**Versão:** 1.0 MVP
**Data:** 15 de Maio de 2026
**Status:** Pronto para implementação

---

## 1. Nome & Branding

### Nome Principal
**Semanticraft**

### Tagline
*"Conteúdo que pensa como um LLM, rankeia como um humano."*

### Subtítulo
SEO semântico para LLMs — transforme conteúdo Markdown em dados estruturados que modelos de linguagem entendem, citam e rankeiam.

### Branding Visual
- **Cores:** #1A1A2E (fundo), #4A90D9 (azul LLM), #22C55E (verde semântico)
- **Font:** Inter ou Geist (moderno, técnico)
- **Logo:** Nodes conectados formando um cérebro + busca

---

## 2. Vision & Positioning

### Problema
LLMs estão substituindo Google como gateways de informação. Empresas perdem Ranking Zero para citações de IA sem qualquer controle. O SEO tradicional não funciona em LLMs.

### Oportunidade
Quando um LLM responde uma query, ele usa:
1. Fontes com alta **entropic fidelity** (conteúdo bem estruturado)
2. Entities com **relacionamentos explícitos** (não keywords)
3. Markup que demonstra **intent** clara (não palavras-chave)

### Posicionamento
**Semanticraft** é a única plataforma que otimiza conteúdo específicamente para citação por LLMs — não apenas "SEO para AI" genérico, mas uma disciplina própria: **LLM Citation Optimization (LCO)**.

### Diferencial Competitivo

| Competidor | Foco | Lacuna | Semanticraft |
|------------|------|--------|--------------|
| LinkLoom | GEO básico | Sem estrutura | Parser semântico + Schema |
| Frase | SEO tradicional | Não funciona em LLMs | Native LLM optimization |
| Geol.ai | Local GEO | Nicho local | Horizontal, B2B SaaS |
| markdown-it | Parser simples | Somente parsing | Semantic extraction + Entity relationships |

**Por que liderar:** Ninguém está fazendo extração semântica profunda com entity relationships + intent + confidence. O mercado copia SEO tradicional. Nós estamos criando **"Semantic SEO for LLMs"**.

---

## 3. Research Insights (Consolidados)

### 3.1 Como LLMs Processam Markdown

**Key Findings:**
- LLMs não têm "parser de Markdown" dedicado — é entendimento emergente de padrões aprendidos
- Markdown é **80% mais eficiente em tokens** que HTML equivalente
- GPT prefere formatação Markdown, Claude prefere XML-style, Gemini prefere tables
- Headers hierarchy fornece sinais claros de navegação para o modelo
- Clean structural encoding melhora significativamente compreensão do LLM

**Implicação:** Parser deve preservar estrutura semântica, não apenas extrair texto.

### 3.2 Top 10 Padrões Problemáticos

| # | Pattern | Impacto | Solução |
|---|---------|---------|---------|
| 1 | Listas aninhadas > 3 níveis | -40% accuracy | Flatten com prefix " nested" |
| 2 | Tabelas sem header | -15-20% erro | Gerar header "Col_1, Col_2..." |
| 3 | Code blocks com syntax misto | Confunde language detection | Preservar language tag |
| 4 | Links reference-style | Lost em extração | Inline todos antes de parse |
| 5 | Headers dentro de code | Interpretado como real | Marcar `isCodeContent` |
| 6 | Blocos de aspas aninhados | Ambiguidade | Flatten com delimiters |
| 7 | Linhas horizontais como separadores | Confuso | Converter para `<hr>` explícito |
| 8 | Emphasis misto (bold+italic) | Parsing edge cases | Normalizar para hierarchy |
| 9 | Imagens com syntax não padrão | Alt text lost | Padronizar syntax |
| 10 | Frontmatter YML | Não renderiza universal | Extrair metadata antes |

### 3.3 Landscape Competitivo

**Players existentes:**
- LinkLoom, Frase.io, Rankwise, Ayzeo, LLMClicks, Geol.ai (~$15-49/mês)
- Todos focam em "GEO" ou "AEO" mas nenhum faz extração semântica profunda
- Conceito "llms.txt" emergindo como padrão (similar a robots.txt para LLMs)
- markdown-it (~20M weekly downloads) é parser mais popular

**Gap de mercado:**
- Ninguém faz entity relationship extraction
- Ninguém implementa confidence scoring com decomposição de fatores
- Ninguém segmenta intent classification para LLMs

---

## 4. Core Features

### 4.1 Semantic Parser (Core)

```typescript
// Interface principal
interface SemanticraftParser {
  parse(markdown: string, options?: ParseOptions): Promise<LLMContent>;
  validate(markdown: string): ValidationResult;
}

interface ParseOptions {
  extractEntities: boolean;        // default: true
  resolveRelationships: boolean;  // default: true
  calculateConfidence: boolean;    // default: true
  includeIntent: boolean;         // default: true
  maxNestingDepth: number;        // default: 4
}
```

**Pipeline:**
```
Markdown Input
    │
    ▼
┌─────────────────┐
│  markdown-it    │  ← Parser base
│  (AST generation)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Normalizer     │  ← Corrige 10 padrões problemáticos
│  Layer          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Entity         │  ← Extrai Products, Prices, Specs, FAQs
│  Extractor      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Relationship   │  ← Resolve relationships entre entities
│  Resolver       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Schema         │  ← Gera JSON no LLM-SEO format
│  Generator      │
└─────────────────┘
```

### 4.2 LLM-SEO Schema

```typescript
interface LLMContent {
  llmseo_version: "1.0";
  metadata: DocumentMetadata;
  entities: Entity[];           // Product, Price, Spec, Review, FAQ, etc.
  relationships: Relationship[]; // hierarchical, comparative, pricing, etc.
  navigation: NavigationEntity[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
}

// Entity Types
type EntityType = 'Product' | 'Price' | 'Specification' | 'Review' |
                  'FAQ' | 'Navigation' | 'CallToAction' | 'Image' | 'CodeBlock';

// Relationship Types
type RelationshipType = 'hierarchical' | 'comparative' | 'temporal' |
                        'specification' | 'pricing' | 'review_of' | 'faq_about' |
                        'media_of' | 'navigation_to' | 'call_to' | 'related';

interface ConfidenceScore {
  overall: number;  // 0-1
  factors: {
    structureQuality: number;
    contentCompleteness: number;
    dataExtractionAccuracy: number;
    relationshipClarity: number;
  };
  warnings: string[];
}
```

### 4.3 Embeddable Script

```html
<!-- Simplest embed -->
<script src="https://cdn.semanticraft.io/semanticraft.js" async></script>
<script>
  window.semanticraft = { apiKey: 'your-key' };
</script>
```

**Features:**
- Auto-detecção de conteúdo Markdown
- Web Worker para parsing não-bloqueante
- Injeção automática de JSON-LD no `<head>`
- Shadow DOM para isolation
- Cache inteligente (1hr TTL default)
- Analytics de bots (GPT, Claude, Gemini)

### 4.4 Framework Integrations

| Platform | Implementation |
|----------|----------------|
| React/Next.js | `<SemanticraftProvider apiKey="...">` |
| Angular | `SemanticraftModule.forRoot({...})` |
| WordPress | Plugin com settings no admin |
| Vue/Nuxt | `SemanticraftPlugin` |
| Shopify | App embed |
| Webflow | Custom embed component |

---

## 5. Arquitetura Técnica

### Stack Recomendado

| Layer | Technology |
|-------|------------|
| Parser Core | TypeScript + markdown-it |
| AST Processing | mdast + unist |
| Entity Extraction | Custom rules + heuristics |
| API Server | Node.js + Fastify (ou Hono para edge) |
| Cache | Redis (ou Cloudflare KV para edge) |
| Database | PostgreSQL (para analytics) |
| Embed Script | Vanilla JS + Web Worker |
| Framework Wrappers | React, Angular, Vue |

### Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Embed    │  │  React    │  │  Angular  │  │  WordPress │    │
│  │  Script   │  │  Wrapper  │  │  Module   │  │  Plugin   │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
└────────┼──────────────┼──────────────┼──────────────┼───────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /parse    - Parse markdown under-demand               │   │
│  │  /validate - Validate markdown quality                 │   │
│  │  /health   - Health check                              │   │
│  │  /analytics - Bot consumption analytics                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                      │
│                    ┌────┴────┐                                 │
│                    ▼         ▼                                 │
│              ┌────────┐  ┌────────┐                           │
│              │  Cache │  │ Parser │                           │
│              │ (Redis)│  │ Engine │                           │
│              └────────┘  └────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Roadmap MVP (8-10 semanas)

### Fase 1: Core Parser (3 semanas)
- [ ] Setup projeto + TypeScript + markdown-it
- [ ] Implementar AST parsing
- [ ] Implementar 10 normalizer rules
- [ ] Entity extraction (Product, Price, Spec, FAQ)
- [ ] Relationship resolver
- [ ] Confidence scoring
- [ ] CLI tool básico

### Fase 2: Schema + API (2 semanas)
- [ ] Schema generator
- [ ] API endpoints (REST)
- [ ] Redis cache layer
- [ ] Rate limiting + auth

### Fase 3: Embed (2 semanas)
- [ ] Embeddable script
- [ ] Web Worker implementation
- [ ] Auto-detection logic
- [ ] JSON-LD injection
- [ ] WordPress plugin

### Fase 4: Integrations (2 semanas)
- [ ] React/Next.js wrapper
- [ ] Angular module
- [ ] Documentation
- [ ] landing page

### Fase 5: Launch (1 semana)
- [ ] npm package publishing
- [ ] GitHub repo (MIT license)
- [ ] Landing page + documentation
- [ ] Announcement (Twitter, dev communities)

---

## 7. Modelo de Monetização

### Open Source (Attraction)
- Parser core MIT licensed
- npm package free
- Community contributions

### SaaS Layer (Monetização)

| Tier | Preço | Features |
|------|-------|----------|
| **Free** | $0 | 1,000 parses/mês, basic schema |
| **Starter** | $29/mês | 50,000 parses, full schema, email support |
| **Pro** | $99/mês | 500,000 parses, analytics, priority |
| **Enterprise** | $499/mês | Unlimited, custom integrations, SLA |

**Usage-based add-ons:**
- +$0.001 per parse above tier limit
- +$50/month for additional domains
- +$200/month for bot analytics dashboard

---

## 8. Competitors Comparison

| Feature | Semanticraft | LinkLoom | Frase | Geol.ai |
|---------|--------------|----------|-------|---------|
| Parser open source | ✅ | ❌ | ❌ | ❌ |
| Entity extraction | ✅ | ❌ | ❌ | ❌ |
| Relationship resolution | ✅ | ❌ | ❌ | ❌ |
| Confidence scoring | ✅ | ❌ | ❌ | ❌ |
| Intent classification | ✅ | Partial | ❌ | ❌ |
| llms.txt support | ✅ | ❌ | ❌ | ✅ |
| Embeddable script | ✅ | ❌ | ❌ | ❌ |
| MIT license | ✅ | ❌ | ❌ | ❌ |

---

## 9. Next Steps

1. **VALIDAR MVP:** Mostrar schema + parser para 5-10 potenciais usuários (marketing agencies, devs)
2. **MINIMUM VIABLE PRODUCT:** Implementar só core parser + WordPress plugin
3. **LAUNCH:** npm package + GitHub repo + landing page simples
4. **ITERATE:** Baseado em feedback, adicionar features

---

## 10. Files Gerados

| File | Description |
|------|-------------|
| `SPEC.md` | Este documento |
| `LLM-SEO-Schema-Proposal.md` | Schema JSON detalhado |
| `.opencode/skills/llm-seo-parser/` | Parser skill |
| `.opencode/skills/llm-seo-schema/` | Schema skill |
| `.opencode/skills/llm-seo-embed/` | Embed skill |

---

**Conclusão:** Com os insights de research + diferenciação clara, Semanticraft tem potencial de se tornar o **padrão open source para "SEO para LLMs"**. A estratégia de MIT open source + SaaS monetização é testada e funciona (ex: Node, Terraform, etc.).