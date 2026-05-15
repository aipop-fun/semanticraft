# Contributing to Semanticraft

Obrigado por contribuir! Por favor, leia este guia antes de fazer pull requests ou issues.

## Setup

```bash
git clone https://github.com/aipop-fun/semanticraft.git
cd semanticraft
npm install
```

## Development

```bash
# Build parser
npm run build --workspace=@semanticraft/parser

# Run tests
npm run test --workspace=@semanticraft/parser

# Type check
npm run typecheck --workspace=@semanticraft/parser
```

## Architecture

```
semanticraft/
├── packages/
│   ├── parser/     # Core parsing library
│   ├── schema/     # Schema generation
│   ├── embed/      # Embeddable script
│   ├── cli/        # CLI tool
│   └── api/        # REST API
└── SPEC.md         # Full specification
```

## Adding Normalizer Rules

Quando adicionar regras de normalização, considere:

1. O padrão causa confusão em LLMs?
2. Existe solução documentada?
3. O regex cobre edge cases?

## Adding Entity Types

1. Adicionar tipo em `src/types/entities.ts`
2. Implementar extração em `src/extractor/`
3. Adicionar tests
4. Atualizar schema se necessário

## Pull Request Process

1. Fork o repo
2. Crie branch feature/bugfix
3. Adicione tests
4. Ensure tests pass
5. Submit PR com description clara

## Reporting Bugs

Use issue templates. Inclua:
- Markdown sample que causa problema
- Output esperado vs atual
- Versão do Node.js

## License

MIT © aipop-fun