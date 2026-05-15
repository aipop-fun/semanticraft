# @semanticraft/react

React wrapper for semanticraft parser.

## Installation

```bash
npm install @semanticraft/react
```

## Usage

### Provider Setup

```tsx
import { SemanticraftProvider } from '@semanticraft/react';

function App() {
  return (
    <SemanticraftProvider apiKey="your-api-key" mode="static">
      <YourApp />
    </SemanticraftProvider>
  );
}
```

### useSemanticraft Hook

```tsx
import { useSemanticraft } from '@semanticraft/react';

function ProductInfo({ content }: { content: string }) {
  const { data, parse, isLoading, error, entities, intent } = useSemanticraft();

  useEffect(() => {
    parse(content);
  }, [content, parse]);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{intent?.primary}</h1>
      {entities.map(entity => (
        <EntityCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
```

### SemanticraftContent Component

```tsx
import { SemanticraftContent } from '@semanticraft/react';

function ArticlePage({ markdown }: { markdown: string }) {
  return (
    <SemanticraftContent
      children={markdown}
      renderLoading={() => <LoadingSkeleton />}
      renderError={(error) => <ErrorBoundary error={error} />}
    />
  );
}
```

## Props

### SemanticraftProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | - | API key for semanticraft service |
| `contentSelector` | `string` | `'article'` | CSS selector for content extraction |
| `mode` | `'static' \| 'dynamic' \| 'ssr'` | `'static'` | Parsing mode |
| `parseOptions` | `ParseOptions` | - | Parser configuration options |
| `onError` | `(error: Error) => void` | - | Error callback |

### useSemanticraft

Returns typed access to parsed content with entities, relationships, intent classification, and confidence scores.

### SemanticraftContent

Auto-parses markdown content with loading and error states.

## SSR Support

Compatible with Next.js App Router and other SSR frameworks. Client components use `'use client'` directive.

## License

MIT