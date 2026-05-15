# Embed Script Guide

Guia de uso do `@semanticraft/embed` - Script embeddável para sites.

## Instalação

### Via CDN

```html
<script src="https://cdn.semanticraft.dev/embed/latest/semanticraft.global.js"></script>
```

### Via NPM

```bash
npm install @semanticraft/embed
```

## Uso Básico

### Carregamento Automático

O script detecta automaticamente conteúdo markdown na página:

```html
<script src="https://cdn.semanticraft.dev/embed/latest/semanticraft.global.js"></script>

<article class="semanticraft">
# Meu Produto

**Preço:** R$ 99,90

Texto do produto...
</article>
```

### Inicialização Manual

```typescript
window.semanticraft.init({
  selector: '.my-content',
  autoInject: true,
  confidenceThreshold: 0.5,
});
```

## Opções de Configuração

### Opções Globais

```typescript
window.semanticraft.init({
  selector: '.markdown-content',
  autoInject: true,
  injectFormat: 'json-ld',
  confidenceThreshold: 0.5,
  debug: false,
});
```

| Opção | Tipo | Default | Descrição |
|-------|------|---------|----------|
| `selector` | `string` | `'.semanticraft'` | CSS selector para elementos |
| `autoInject` | `boolean` | `true` | Auto-injeta JSON-LD |
| `injectFormat` | `string` | `'json-ld'` | Formato: `json-ld`, `microdata` |
| `confidenceThreshold` | `number` | `0.3` | Threshold mínimo |
| `debug` | `boolean` | `false` | Modo debug |

## Métodos

### parse

Parseia conteúdo markdown.

```typescript
const result = window.semanticraft.parse(markdown);
```

### parseElement

Parseia conteúdo de um elemento DOM.

```typescript
const result = window.semanticraft.parseElement(document.querySelector('.content'));
```

### getSchema

Retorna schema gerado.

```typescript
const schema = window.semanticraft.getSchema(element);
```

### injectJSONLD

Injeta JSON-LD no head da página.

```typescript
window.semanticraft.injectJSONLD(result);
```

## Formatos de Output

### JSON-LD

```html
<script type="application/ld+json">
{
  "@context": "https://semanticraft.dev/schema/llmseo/v1",
  "llmseo_version": "1.0",
  "entities": [...]
}
</script>
```

### Microdata

```html
<div itemscope itemtype="https://semanticraft.dev/schema/Product">
  <span itemprop="name">iPhone 15</span>
  <span itemprop="price">9499</span>
</div>
```

## Eventos

```typescript
window.semanticraft.on('parse', (result) => {
  console.log('Parsed:', result.entities.length);
});

window.semanticraft.on('error', (error) => {
  console.error('Error:', error);
});

window.semanticraft.on('inject', (element) => {
  console.log('Injected into:', element);
});
```

## Exemplo Completo

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meu Produto</title>
  <script src="https://cdn.semanticraft.dev/embed/latest/semanticraft.global.js"></script>
</head>
<body>
  <article class="semanticraft" id="product-content">
# iPhone 15 Pro Max

**Preço:** R$ 9.499
**Cor:** Azul Titanium

Tela Super Retina XDR de 6.7 polegadas.
Câmera Pro com 48MP.

## FAQ

**P: Tem 5G?**
R: Sim.

**P: Suporta carregamento sem fio?**
R: MagSafe até 15W.
  </article>

  <script>
    window.semanticraft.init({
      selector: '#product-content',
      autoInject: true,
      confidenceThreshold: 0.5,
      debug: true,
    });

    window.semanticraft.on('parse', (result) => {
      console.log('Intent:', result.intent.primary);
      console.log('Confidence:', result.confidence.overall);
    });
  </script>
</body>
</html>
```

## Troubleshooting

### Script não carrega

Verifique se o CDN está acessível:

```html
<script>
  if (typeof window.semanticraft === 'undefined') {
    console.error('Semanticraft failed to load');
  }
</script>
```

### Conteúdo não parseado

Verifique se o seletor está correto:

```typescript
window.semanticraft.init({
  selector: '.meu-seletor',
  debug: true,
});
```

### JSON-LD não injetado

Verifique se `autoInject` está ativo:

```typescript
window.semanticraft.init({
  autoInject: true,
});
```

Force injeção manual:

```typescript
const result = window.semanticraft.parseElement(element);
window.semanticraft.injectJSONLD(result);
```