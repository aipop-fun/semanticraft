# Getting Started

 Guia de instalação e uso rápido do Semanticraft.

## Instalação

### Parser (Node.js)

```bash
npm install @semanticraft/parser
```

### Schema

```bash
npm install @semanticraft/schema
```

### CLI

```bash
npm install -g @semanticraft/cli
```

### API Server

```bash
npm install @semanticraft/api
```

### React

```bash
npm install @semanticraft/react
```

### Angular

```bash
npm install @semanticraft/angular
```

## Uso Básico

### Parser

```typescript
import { createParser } from '@semanticraft/parser';

const parser = createParser();

const result = await parser.parse(`
# iPhone 15 Pro Max

**Preço:** R$ 9.499

Tela de 6.7" com tecnologia Super Retina XDR.
Câmera de 48MP com modo Pro.

## Especificações

| Feature | Valor |
|---------|-------|
| Tela | 6.7" |
| RAM | 8GB |

## FAQ

**P: Tem 5G?**
R: Sim, suporte completo a 5G.

**P: Quanto pesa?**
R: 221 gramas.
`);

console.log(result.entities);
console.log(result.relationships);
console.log(result.intent);
console.log(result.confidence);
```

### CLI

```bash
semanticraft parse ./meu-arquivo.md
```

```bash
semanticraft validate ./schema.json
```

```bash
semanticraft serve --port 3000
```

### API Server

```typescript
import { buildServer } from '@semanticraft/api';

const server = await buildServer();
await server.listen({ port: 3000 });
```

## Configuração

### Parser Options

```typescript
const parser = createParser({
  extractImages: true,
  extractCodeBlocks: true,
  extractLinks: true,
  confidenceThreshold: 0.5,
});
```

### CLI Config

Crie `semanticraft.config.js` no projeto:

```javascript
export default {
  parser: {
    extractImages: true,
    confidenceThreshold: 0.5,
  },
  output: 'json',
};
```

## Troubleshooting

### ERRO: peerDependencies not met

**Solução:** Instale as dependências obrigatórias:

```bash
npm install markdown-it
```

### ERRO: Module not found

**Solução:** Verifique se o Node.js é >= 18:

```bash
node --version
```

### ERRO: Parser returns empty entities

**Causa:** O markdown pode não ter entidades identificáveis.

**Solução:** Adicione conteúdo mais descritivo com preços, especificações ou perguntas.

### CLI não reconhecido após instalação global

**Solução:** Verifique o PATH ou use npx:

```bash
npx @semanticraft/cli parse ./arquivo.md
```