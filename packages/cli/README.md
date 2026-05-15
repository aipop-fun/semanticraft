# @semanticraft/cli

CLI tool for semanticraft parser - Transform Markdown into LLM-optimized structured data.

## Installation

```bash
npm install -g @semanticraft/cli
```

Or use via npx:

```bash
npx @semanticraft/cli parse input.md
```

## Commands

### parse

Parse markdown file and output JSON:

```bash
semanticraft parse input.md -o output.json
```

Read from stdin:

```bash
cat input.md | semanticraft parse -o output.json
```

Watch mode for file changes:

```bash
semanticraft parse input.md --watch
```

### validate

Validate markdown quality and show warnings:

```bash
semanticraft validate input.md
```

Show specific normalizer rule violations:

```bash
semanticraft validate input.md --rules
```

### serve

Start local API server:

```bash
semanticraft serve --port 3000
```

Endpoints:
- `GET /health` - Health check
- `POST /parse` - Parse markdown (body: raw markdown string)

### init

Create new semanticraft project:

```bash
semanticraft init --dir my-project
```

## Configuration

Create `semanticraft.config.json` in your project:

```json
{
  "semanticraft": {
    "version": "1.0.0",
    "rules": {
      "maxHeadingLevel": 6,
      "allowHtml": false,
      "normalizeWhitespace": true
    }
  }
}
```

## License

MIT