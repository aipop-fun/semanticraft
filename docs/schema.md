# Schema Documentation

Documentação do `@semanticraft/schema` - Schema generator e validator.

## LLMContent Schema

O schema de saída do Semanticraft, otimizado para LLMs:

```typescript
interface LLMContent {
  llmseo_version: '1.0';
  metadata: DocumentMetadata;
  entities: Entity[];
  relationships: Relationship[];
  intent: IntentClassification;
  confidence: ConfidenceScore;
}
```

## Funções

### generateSchema

Gera schema LLMContent válido.

```typescript
import { generateSchema } from '@semanticraft/schema';

const result = generateSchema({
  entities,
  relationships,
  intent,
  confidence,
  metadata,
});
```

### generateFromPartial

Gera schema com dados parciais (preenche valores padrão).

```typescript
import { generateFromPartial } from '@semanticraft/schema';

const result = generateFromPartial({
  entities: partialEntities,
});
```

### mergeSchemas

Merge múltiplos schemas em um.

```typescript
import { mergeSchemas } from '@semanticraft/schema';

const merged = mergeSchemas([schema1, schema2]);
```

## Validação

### validateSchema

Valida um objeto contra o schema LLMContent.

```typescript
import { validateSchema } from '@semanticraft/schema';

const result = validateSchema(data);

if (!result.success) {
  console.log(result.errors);
}
```

## Utilitários

### isEntityOfType

Verifica se uma entidade é de um tipo específico.

```typescript
import { isEntityOfType } from '@semanticraft/schema';

if (isEntityOfType(entity, 'Product')) {
  // entity é do tipo Product
}
```

### getEntityById

Busca entidade por ID.

```typescript
import { getEntityById } from '@semanticraft/schema';

const entity = getEntityById(schema.entities, 'prod-1');
```

### getEntitiesByType

Busca entidades por tipo.

```typescript
import { getEntitiesByType } from '@semanticraft/schema';

const products = getEntitiesByType(schema.entities, 'Product');
const offers = getEntitiesByType(schema.entities, 'Offer');
```

## Intent Classification

### classifyIntent

Classifica intent baseado nas entidades.

```typescript
import { classifyIntent } from '@semanticraft/schema';

const intent = classifyIntent(entities);
```

### inferPageType

Infere o tipo de página.

```typescript
import { inferPageType } from '@semanticraft/schema';

const pageType = inferPageType(signals, entities);
```

## Confidence Scoring

### calculateConfidence

Calcula score de confiança.

```typescript
import { calculateConfidence } from '@semanticraft/schema';

const score = calculateConfidence({
  entities,
  relationships,
  markdownLength: 1500,
});
```

### getConfidenceLevel

Retorna nível textual de confiança.

```typescript
import { getConfidenceLevel, isHighConfidence } from '@semanticraft/schema';

const level = getConfidenceLevel(score);
const isHigh = isHighConfidence(score);
```

## Zod Schemas

Para uso com Zod diretamente:

```typescript
import {
  EntitySchema,
  RelationshipSchema,
  IntentClassificationSchema,
  ConfidenceScoreSchema,
  LLMContentSchema,
} from '@semanticraft/schema/zod';

const validated = LLMContentSchema.parse(data);
```

## Exemplo Completo

```typescript
import {
  generateSchema,
  validateSchema,
  getEntitiesByType,
  classifyIntent,
  calculateConfidence,
} from '@semanticraft/schema';

const entities = [/* ... */];
const relationships = [/* ... */];

const intent = classifyIntent(entities);
const confidence = calculateConfidence({
  entities,
  relationships,
  markdownLength: 2000,
});

const schema = generateSchema({
  entities,
  relationships,
  intent,
  confidence,
  metadata: {
    title: 'iPhone 15 Pro',
    language: 'pt-BR',
  },
});

const validation = validateSchema(schema.data);

if (validation.success) {
  const products = getEntitiesByType(schema.data.entities, 'Product');
  console.log('Products:', products);
}
```