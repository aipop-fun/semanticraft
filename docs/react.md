# React Integration

Guia de uso do `@semanticraft/react`.

## Instalação

```bash
npm install @semanticraft/react
```

## Provider

Configure o provider na raiz da aplicação:

```typescript
import { SemanticraftProvider } from '@semanticraft/react';

function App() {
  return (
    <SemanticraftProvider apiKey="your-api-key">
      <MyApp />
    </SemanticraftProvider>
  );
}
```

### Props do Provider

| Prop | Tipo | Default | Descrição |
|------|------|---------|----------|
| `apiKey` | `string` | - | API key opcional |
| `baseUrl` | `string` | API pública | URL base da API |
| `autoParse` | `boolean` | `true` | Auto-parse ao montar |
| `confidenceThreshold` | `number` | `0.3` | Threshold mínimo |

## Hooks

### useParser

Hook principal para parsing.

```typescript
import { useParser } from '@semanticraft/react';

function ProductPage({ markdown }) {
  const { parse, result, loading, error } = useParser();

  useEffect(() => {
    parse(markdown);
  }, [markdown]);

  if (loading) return <div>Parsing...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{result?.intent.primary}</h1>
      <p>Confidence: {result?.confidence.overall}</p>
    </div>
  );
}
```

### useEntities

Hook para acessar entidades filtradas.

```typescript
import { useEntities } from '@semanticraft/react';

function ProductInfo() {
  const { products, offers, specifications, isLoading } = useEntities({
    types: ['Product', 'Offer', 'Specification'],
  });

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
      {offers.map(o => <PriceTag key={o.id} offer={o} />)}
    </div>
  );
}
```

### useIntent

Hook para acessar intent classificada.

```typescript
import { useIntent } from '@semanticraft/react';

function PageHeader() {
  const { primary, secondary, confidence, pageType } = useIntent();

  return (
    <div>
      <span>Intent: {primary}</span>
      <span>Page Type: {pageType}</span>
      <span>Confidence: {confidence}</span>
    </div>
  );
}
```

### useConfidence

Hook para acessar confidence score.

```typescript
import { useConfidence } from '@semanticraft/react';

function QualityIndicator() {
  const { overall, factors, warnings } = useConfidence();

  return (
    <div>
      <span>Overall: {overall}</span>
      {warnings.map(w => <Warning key={w} text={w} />)}
    </div>
  );
}
```

## Componentes

### SemanticraftProvider

Provider raiz.

```typescript
<SemanticraftProvider
  apiKey="key"
  baseUrl="https://api.semanticraft.dev"
  autoParse={true}
  confidenceThreshold={0.5}
>
  {children}
</SemanticraftProvider>
```

### ParseableContent

Componente que parseia conteúdo.

```typescript
<ParseableContent markdown={markdown}>
  {({ entities, intent, confidence }) => (
    <div>
      <IntentBadge intent={intent} />
      <EntityList entities={entities} />
    </div>
  )}
</ParseableContent>
```

### EntityCard

Componente para exibir entidade.

```typescript
<EntityCard entity={entity} showConfidence />
```

### JSONLDOutput

Componente que renderiza JSON-LD.

```typescript
<JSONLDOutput schema={schema} />
```

## Exemplos

### Produto com Preço

```typescript
import {
  SemanticraftProvider,
  useParser,
  useEntities,
} from '@semanticraft/react';

function ProductPage({ markdown }) {
  return (
    <SemanticraftProvider>
      <ProductContent markdown={markdown} />
    </SemanticraftProvider>
  );
}

function ProductContent({ markdown }) {
  const { parse } = useParser();
  const { products, offers } = useEntities({
    types: ['Product', 'Offer'],
  });

  useEffect(() => {
    parse(markdown);
  }, [markdown]);

  if (!products.length) return null;

  return (
    <div>
      <h1>{products[0].normalizedName}</h1>
      {offers.map(o => (
        <span key={o.id}>
          R$ {o.price.toLocaleString('pt-BR')}
        </span>
      ))}
    </div>
  );
}
```

### FAQ com Perguntas

```typescript
import { useEntities } from '@semanticraft/react';

function FAQ({ markdown }) {
  const { questions } = useEntities({ types: ['Question'] });

  return (
    <dl>
      {questions.map(q => (
        <div key={q.id}>
          <dt>{q.content}</dt>
          <dd>{q.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
```

### Página de Review

```typescript
import { useIntent } from '@semanticraft/react';

function ReviewPage({ markdown }) {
  const { primary, pageType, confidence } = useIntent();

  return (
    <article>
      <header>
        <span>Tipo: {pageType}</span>
        <span>Intent: {primary}</span>
        <span>Confiança: {confidence}</span>
      </header>
      <Reviews />
    </article>
  );
}
```

## SSR

Para Next.js:

```typescript
import { getServerSchema } from '@semanticraft/react/ssr';

export async function getServerSideProps() {
  const markdown = await fetchMarkdown();
  const schema = await getServerSchema(markdown);

  return { props: { schema } };
}
```