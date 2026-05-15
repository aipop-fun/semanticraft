# Contributing

Guia para contribuir com o Semanticraft.

## Primeiros Passos

### Clone

```bash
git clone https://github.com/aipop-fun/semanticraft.git
cd semanticraft
```

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Estrutura

```
semanticraft/
├── packages/
│   ├── parser/       # Parser principal
│   ├── schema/       # Schema generator
│   ├── embed/        # Script embeddável
│   ├── cli/          # CLI
│   ├── api/          # API server
│   ├── react/        # React integration
│   ├── angular/      # Angular integration
│   └── wordpress/    # WordPress plugin
└── docs/             # Documentação
```

## Fluxo de Desenvolvimento

### 1. Branch

```bash
git checkout -b feature/minha-feature
```

### 2. Desenvolvimento

```bash
npm run dev
```

### 3. Testes

```bash
npm test
npm run test:watch
```

### 4. Lint

```bash
npm run lint
```

### 5. Typecheck

```bash
npm run typecheck
```

## Commits

Use Conventional Commits:

```
feat(parser): add nested list support
fix(schema): correct confidence calculation
docs(api): update endpoint documentation
test(cli): add validation tests
```

## Pull Request

### Antes de PR

1. Tests passando
2. Lint passando
3. Types corretos
4. Docs atualizadas

### Template

```markdown
## Descrição

Breve descrição do que foi feito.

## Tipo de Mudança

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Checklist

- [ ] Testes adicionados
- [ ] Lint passando
- [ ] Types atualizados
- [ ] Docs atualizadas

## Screenshots (se UI)
```

## Packages

### Parser

Local: `packages/parser/`

```bash
npm run build --workspace=@semanticraft/parser
```

### Schema

Local: `packages/schema/`

```bash
npm run build --workspace=@semanticraft/schema
```

### CLI

Local: `packages/cli/`

```bash
npm run build --workspace=@semanticraft/cli
```

### API

Local: `packages/api/`

```bash
npm run build --workspace=@semanticraft/api
```

### React

Local: `packages/react/`

```bash
npm run build --workspace=@semanticraft/react
```

### Angular

Local: `packages/angular/`

Build automático via Angular CLI.

## Testing

### Unit Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm test -- --coverage
```

## Style Guide

### TypeScript

- Use `interface` para tipos
- Use `type` para unions
- Evite `any`
- Use Optional Chaining

```typescript
// Bom
const name = entity?.normalizedName ?? 'Unknown';

// Ruim
const name = entity && entity.normalizedName || 'Unknown';
```

### Naming

| Tipo | Convenção |
|------|-----------|
| Variaveis | camelCase |
| Constantes | SCREAMING_SNAKE_CASE |
| Funções | camelCase |
| Classes | PascalCase |
| Interfaces | PascalCase |
| Arquivos | kebab-case |

## Bugs

### Reportar

Use GitHub Issues com:

1. Descrição clara
2. Passos para reproduzir
3. Comportamento esperado
4. Environment (Node version, OS)

### Reproduzir

```bash
git clone --branch <bug-branch> https://github.com/aipop-fun/semanticraft.git
cd semanticraft
npm install
npm test
```

## License

MIT - see [LICENSE](../LICENSE)