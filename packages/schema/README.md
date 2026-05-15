# @semanticraft/schema

Schema generator for Semanticraft that transforms parsed entities into LLMContent JSON.

## Installation

```bash
npm install @semanticraft/schema
```

## Usage

```typescript
import { generateSchema, validateSchema } from '@semanticraft/schema';

const result = generateSchema({
  entities: parsedEntities,
  relationships: resolvedRelationships,
  intent: classifiedIntent,
  confidence: calculatedConfidence,
  metadata: docMetadata
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.errors);
}
```

## Features

- Generates LLMContent JSON matching SPEC.md schema
- Zod runtime validation for output
- Intent classification helpers
- Confidence score calculation
- Metadata versioning support

## API

### generateSchema(input)

Transforms parser output into validated LLMContent JSON.

### validateSchema(data)

Validates arbitrary data against the LLMContent Zod schema.

### Intent Classification

Helper functions for intent-based schema generation.

### Confidence Calculation

Utilities for computing confidence scores from entity quality.