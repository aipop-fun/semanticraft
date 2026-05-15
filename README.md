# Semanticraft

**SEO semântico para LLMs — Transforme conteúdo Markdown em dados estruturados que modelos de linguagem entendem, citam e rankeiam.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-v1.0.0--alpha.1-red)](https://www.npmjs.com/package/@semanticraft/parser)
[![Discord](https://img.shields.io/badge/Discord-Join-brightgreen)](https://discord.gg/semanticraft)

## O Problema

LLMs estão substituindo Google como gateways de informação. Empresas perdem **Ranking Zero** para citações de IA sem qualquer controle. O SEO tradicional não funciona em LLMs.

Quando um LLM responde uma query, ele prioriza:
- Fontes com alta **entropic fidelity** (conteúdo bem estruturado)
- Entities com **relacionamentos explícitos** (não keywords)
- Markup que demonstra **intent** clara (não palavras-chave)

## A Solução

**Semanticraft** é uma suíte open source que transforma Markdown em dados estruturados otimizados para LLMs:

- 📦 **Parser** (`@semanticraft/parser`) — Extrai entidades semânticas com relationships
- 🎨 **Schema** (`@semanticraft/schema`) — Formato JSON otimizado para LLMs
- 🏷️ **Embed** (`@semanticraft/embed`) — Script embeddável para qualquer site
- ⚡ **CLI** (`@semanticraft/cli`) — Ferramenta de linha de comando

## Quick Start

```bash
# Install parser
npm install @semanticraft/parser

# Use in code
import { createParser } from '@semanticraft/parser';

const parser = createParser();
const result = await parser.parse(`
# iPhone 15 Pro Max

**Preço:** R$ 9.499

- Tela: 6.7" Super Retina XDR
- Câmera: 48MP

## FAQ

**P: Tem 5G?** R: Sim.
`);

console.log(result.entities);
// [
//   { id: 'prod-1', type: 'Product', name: 'iPhone 15 Pro Max', ... },
//   { id: 'offer-1', type: 'Offer', price: 9499, ... },
//   { id: 'faq-1', type: 'Question', ... }
// ]
```

## Por que Semanticraft?

| Feature | Semanticraft | markdown-it | JSON-LD |
|---------|--------------|-------------|---------|
| Entity extraction | ✅ | ❌ | ❌ |
| Relationship resolution | ✅ | ❌ | ❌ |
| Confidence scoring | ✅ | ❌ | ❌ |
| Intent classification | ✅ | ❌ | ❌ |
| LLM-optimized schema | ✅ | ❌ | ❌ |
| Open source (MIT) | ✅ | ✅ | ✅ |

## Conceitos-Chave

### 1. Normalização de Markdown

Padrões de Markdown que confundem LLMs são automaticamente corrigidos:

- Listas aninhadas > 3 níveis → flatten com marcadores
- Tabelas sem header → gerados headers automaticamente
- Code blocks com syntax misto → language tag preservado

### 2. Schema LLM-SEO

```typescript
interface LLMContent {
  llmseo_version: "1.0";
  metadata: {
    title: string;
    language: string;
    generated_at: string;
  };
  entities: Entity[];           // Product, Price, Spec, Review, FAQ
  relationships: Relationship[]; // hierarchical, pricing, specification
  intent: IntentClassification;  // transactional, informational, comparative
  confidence: ConfidenceScore;  // overall + factors decomposition
}
```

### 3. Embeddable Script

```html
<script src="https://cdn.semanticraft.io/semanticraft.js" async></script>
<script>
  window.semanticraft = { apiKey: 'your-key' };
</script>
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@semanticraft/parser` | Core parser com entity extraction | 🏗️ Alpha |
| `@semanticraft/schema` | Schema generator e validator | 🏗️ Alpha |
| `@semanticraft/embed` | Script embeddável | 📋 Planned |
| `@semanticraft/cli` | CLI tool | 📋 Planned |
| `@semanticraft/api` | REST API server | 📋 Planned |

## Roadmap

- [x] Research completo (MVP spec)
- [ ] v0.1.0 — Parser core + entity extraction
- [ ] v0.2.0 — Relationship resolver + confidence scoring
- [ ] v0.3.0 — CLI tool + embed script
- [ ] v1.0.0 — Full suite + documentation

## Contributing

Contributions são bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

## License

MIT © [aipop-fun](https://github.com/aipop-fun)

---

*"Conteúdo que pensa como um LLM, rankeia como um humano."*