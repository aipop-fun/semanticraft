# @semanticraft/api

Fastify API server for Semanticraft parser.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Dev

```bash
npm run dev
```

## Start

```bash
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `API_KEYS` | - | Comma-separated API keys |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `1 minute` | Rate limit window |

## Endpoints

### POST /parse

Parse markdown into LLMContent JSON.

**Headers:** `X-API-KEY: <key>`

**Body:**
```json
{
  "markdown": "# Hello\n\nWorld",
  "options": { "extractEntities": true }
}
```

**Response:**
```json
{
  "llmseo_version": "1.0",
  "metadata": { "title": "Hello", "language": "pt-BR", "generatedAt": "...", "parserVersion": "0.1.0-alpha.1" },
  "entities": [],
  "relationships": [],
  "intent": { "primary": "informational", "secondary": ["informational"], "confidence": 0.5, "signals": {}, "pageType": "blog" },
  "confidence": { "overall": 0.5, "factors": {}, "warnings": [], "extractedAt": "..." }
}
```

### GET /validate?markdown=...

Validate markdown quality.

**Headers:** `X-API-KEY: <key>`

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": ["..."]
}
```

### GET /health

Health check (no auth required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123,
  "version": "0.1.0-alpha.1"
}
```

## License

MIT