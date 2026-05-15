# @semanticraft/embed

Embeddable script for auto-detecting markdown content and injecting JSON-LD structured data into web pages.

## Installation

### Via Script Tag

```html
<script src="https://cdn.jsdelivr.net/npm/@semanticraft/embed/dist/semanticraft.js"></script>
```

### Via NPM

```bash
npm install @semanticraft/embed
```

## Usage

### Basic Usage

```html
<script>
  window.semanticraft = {
    selectors: ['article', 'main'],
    autoInject: true,
    debug: false,
    workerEnabled: true
  };
</script>
<script src="https://cdn.jsdelivr.net/npm/@semanticraft/embed/dist/semanticraft.js"></script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selectors` | `string[]` | `['article', '[role="main"]', 'main', '.content', '#content']` | CSS selectors for content detection |
| `autoInject` | `boolean` | `true` | Automatically inject JSON-LD after parsing |
| `debug` | `boolean` | `false` | Enable debug logging |
| `workerEnabled` | `boolean` | `true` | Use Web Worker for non-blocking parsing |

## API

### `window.SemanticraftEmbed`

```javascript
const embed = new window.SemanticraftEmbed();
const parsedData = embed.getParsedData();
embed.destroy();
```

### `window.semanticraft` Config

```javascript
window.semanticraft = {
  selectors: ['article', 'main', '.post-content'],
  autoInject: true,
  workerEnabled: true,
  debug: true
};
```

## JSON-LD Output

The script injects Schema.org Article structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "articleBody": "Full markdown content...",
  "text": "Article excerpt...",
  "about": [
    { "@type": "Thing", "name": "Heading 1" },
    { "@type": "Thing", "name": "Heading 2" }
  ],
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-02"
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT