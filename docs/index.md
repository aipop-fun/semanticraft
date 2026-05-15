# Semanticraft

**SEO semântico para LLMs** — Transforme conteúdo Markdown em dados estruturados que modelos de linguagem entendem, citam e rankeiam.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-v1.0.0--alpha.1-red)](https://www.npmjs.com/package/@semanticraft/parser)
[![Discord](https://img.shields.io/badge/Discord-Join-brightgreen)](https://discord.gg/semanticraft)

---

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
npm install @semanticraft/parser
```

```typescript
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

## Conceitos-Chave

### Entropic Fidelity

LLMs funcionam melhor com conteúdo bem estruturado. Semanticraft normaliza Markdown problemático:

- Listas aninhadas > 3 níveis são flatten
- Tabelas sem header recebem headers automaticamente
- Code blocks preservam language tags

### Entity Extraction

Extrai entidades semânticas do conteúdo:

| Tipo | Descrição |
|------|----------|
| `Product` | Produtos com nome, descrição, imagem |
| `Offer` | Ofertas com preço, moeda, disponibilidade |
| `Specification` | Especificações técnicas |
| `Review` | Avaliações e ratings |
| `Question` | Perguntas FAQ |
| `Navigation` | Links de navegação |
| `CallToAction` | Botões e CTAs |
| `Image` | Imagens com alt text |
| `CodeBlock` | Blocos de código |
| `Quote` | Citações |

### Confidence Scoring

Cada entidade recebe um score de confiança de 0 a 1 baseado em:

- Qualidade da estrutura
- Completude do conteúdo
- Precisão da extração
- Clareza dos relacionamentos

---

## Pacotes

| Pacote | NPM | Descrição |
|--------|-----|----------|
| `@semanticraft/parser` | [npm](https://www.npmjs.com/package/@semanticraft/parser) | Parser principal |
| `@semanticraft/schema` | [npm](https://www.npmjs.com/package/@semanticraft/schema) | Schema validator |
| `@semanticraft/embed` | [npm](https://www.npmjs.com/package/@semanticraft/embed) | Script embeddável |
| `@semanticraft/cli` | [npm](https://www.npmjs.com/package/@semanticraft/cli) | CLI tool |
| `@semanticraft/api` | [npm](https://www.npmjs.com/package/@semanticraft/api) | REST API server |
| `@semanticraft/react` | [npm](https://www.npmjs.com/package/@semanticraft/react) | React integration |
| `@semanticraft/angular` | [npm](https://www.npmjs.com/package/@semanticraft/angular) | Angular integration |

## Links

- [GitHub](https://github.com/aipop-fun/semanticraft)
- [Documentação](./getting-started)
- [API Reference](./api)
- [Contributing](./contributing)