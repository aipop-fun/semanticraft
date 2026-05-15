# REST API Reference

API REST do `@semanticraft/api`.

## Endpoints

### GET /health

Health check.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-05-15T10:00:00.000Z"
}
```

### POST /parse

Parseia conteúdo markdown.

**Request:**

```json
{
  "markdown": "# Produto\n\n**Preço:** R$ 99",
  "options": {
    "extractImages": true,
    "confidenceThreshold": 0.5
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "entities": [...],
    "relationships": [...],
    "intent": {...},
    "confidence": {...},
    "metadata": {...}
  }
}
```

### POST /validate

Valida schema LLMContent.

**Request:**

```json
{
  "schema": {
    "llmseo_version": "1.0",
    "entities": [...],
    "relationships": [...],
    "intent": {...},
    "confidence": {...},
    "metadata": {...}
  }
}
```

**Response:**

```json
{
  "success": true,
  "valid": true
}
```

### POST /batch

Parseia múltiplos documentos.

**Request:**

```json
{
  "documents": [
    { "id": "doc1", "markdown": "# Doc 1\n\nContent" },
    { "id": "doc2", "markdown": "# Doc 2\n\nContent" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    { "id": "doc1", "data": {...} },
    { "id": "doc2", "data": {...} }
  ]
}
```

## Autenticação

### API Key

Inclua a API key no header:

```
Authorization: Bearer <api-key>
```

### Rate Limiting

| Plano | Limite |
|-------|--------|
| Free | 100 req/min |
| Pro | 1000 req/min |
| Enterprise | Ilimitado |

## Códigos de Erro

| Código | Descrição |
|--------|----------|
| `400` | Request inválido |
| `401` | API key inválida |
| `403` | Rate limit excedido |
| `422` | Markdown não pode ser parseado |
| `500` | Erro interno |

## Exemplo cURL

```bash
curl -X POST https://api.semanticraft.dev/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <api-key>" \
  -d '{
    "markdown": "# iPhone 15\n\n**Preço:** R$ 9.499"
  }'
```

## SDK JavaScript

```typescript
import { SemanticraftAPI } from '@semanticraft/api';

const client = new SemanticraftAPI({
  apiKey: process.env.SEMANTICRAFT_API_KEY,
  baseUrl: 'https://api.semanticraft.dev',
});

const result = await client.parse({
  markdown: '# Produto\n\n**Preço:** R$ 99',
});
```

## Exemplo Node.js

```typescript
import Fastify from 'fastify';
import { buildServer } from '@semanticraft/api';

const server = Fastify();

server.post('/parse', async (request) => {
  const { markdown, options } = request.body;
  const parser = createParser(options);
  const result = await parser.parse(markdown);
  return result;
});

const app = await buildServer();
await app.listen({ port: 3000 });
```