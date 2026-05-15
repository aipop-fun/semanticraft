# CLI Commands

Comandos da CLI do `@semanticraft/cli`.

## Instalação

```bash
npm install -g @semanticraft/cli
```

## Comandos

### semanticraft parse

Parseia um arquivo markdown.

```bash
semanticraft parse <file> [options]
```

**Argumentos:**

| Argumento | Descrição |
|-----------|----------|
| `<file>` | Arquivo markdown para parsear |

**Options:**

| Opção | Descrição |
|-------|----------|
| `--output, -o` | Arquivo de saída |
| `--format` | Formato: json, yaml |
| `--threshold` | Confidence threshold |
| `--no-images` | Não extrair imagens |
| `--no-code` | Não extrair código |

**Exemplos:**

```bash
semanticraft parse ./meu-post.md
```

```bash
semanticraft parse ./post.md --output ./result.json
```

```bash
semanticraft parse ./post.md --format yaml --threshold 0.5
```

### semanticraft validate

Valida um schema LLMContent.

```bash
semanticraft validate <file> [options]
```

**Exemplos:**

```bash
semanticraft validate ./schema.json
```

```bash
semanticraft validate ./schema.json --strict
```

### semanticraft init

Inicializa configuração na pasta atual.

```bash
semanticraft init [options]
```

**Options:**

| Opção | Descrição |
|-------|----------|
| `--force` | Sobrescreve config existente |
| `--api-key` | Define API key |
| `--parser` | Config do parser |

**Exemplo:**

```bash
semanticraft init --api-key=xxx --parser.extractImages=true
```

### semanticraft serve

Inicia servidor local para testes.

```bash
semanticraft serve [options]
```

**Options:**

| Opção | Default | Descrição |
|-------|---------|----------|
| `--port` | `3000` | Porta do servidor |
| `--host` | `localhost` | Host |
| `--watch` | `false` | Recarregar automático |

**Exemplo:**

```bash
semanticraft serve --port 8080 --watch
```

### semanticraft generate

Gera schema a partir de entidades.

```bash
semanticraft generate [options]
```

**Options:**

| Opção | Descrição |
|-------|----------|
| `--input` | Arquivo com entidades |
| `--output` | Arquivo de saída |
| `--intent` | Intent primária |

### semanticraft stats

Mostra estatísticas de um schema.

```bash
semanticraft stats <file>
```

**Exemplo:**

```bash
semanticraft stats ./schema.json
```

**Output:**

```
Entities: 15
  - Product: 3
  - Offer: 2
  - Specification: 8
  - Question: 2

Intent: transactional (0.85)
Confidence: 0.78

Relationships: 12
```

## Config File

Crie `semanticraft.config.js`:

```javascript
export default {
  parser: {
    extractImages: true,
    extractCodeBlocks: true,
    extractLinks: true,
    confidenceThreshold: 0.5,
  },
  api: {
    endpoint: 'https://api.semanticraft.dev',
    apiKey: process.env.SEMANTICRAFT_API_KEY,
  },
  output: {
    format: 'json',
    indent: 2,
  },
};
```

## Global Options

| Opção | Descrição |
|-------|----------|
| `--help, -h` | Mostra ajuda |
| `--version, -v` | Versão |
| `--debug` | Modo debug |
| `--silent` | Sem output |
| `--config` | Arquivo de config |

## Exit Codes

| Code | Significado |
|------|-------------|
| `0` | Sucesso |
| `1` | Erro geral |
| `2` | Erro de validação |
| `3` | Arquivo não encontrado |
| `4` | API error |

## Exemplos

### Pipeline Completo

```bash
semanticraft init
semanticraft parse ./content.md --output ./schema.json
semanticraft validate ./schema.json
semanticraft stats ./schema.json
```

### Batch Processing

```bash
for file in ./posts/*.md; do
  semanticraft parse "$file" --output "./schemas/$(basename "$file" .md).json"
done
```

### CI/CD Integration

```bash
semanticraft parse ./README.md --output ./schema.json
if [ $? -eq 0 ]; then
  semanticraft validate ./schema.json
fi
```

## Troubleshooting

### semanticraft: command not found

Reinstale globalmente:

```bash
npm uninstall -g @semanticraft/cli
npm install -g @semanticraft/cli
```

### Permission denied

```bash
sudo npm install -g @semanticraft/cli
```

### Config not loading

Verifique se está na pasta correta:

```bash
pwd
ls semanticraft.config.js
```