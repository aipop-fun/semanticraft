# @semanticraft/angular

Angular integration for Semanticraft semantic parsing and content analysis.

## Installation

```bash
npm install @semanticraft/angular
```

## Quick Start

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SemanticraftModule } from '@semanticraft/angular';

@NgModule({
  imports: [
    BrowserModule,
    SemanticraftModule.forRoot({ apiUrl: 'https://api.semanticraft.io', apiKey: 'your-key' })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Services

Inject `SemanticraftService` for direct API access:

```typescript
constructor(private semanticraft: SemanticraftService) {}

async analyzeContent(text: string) {
  const result = await this.semanticraft.parseContent(text, {
    extractEntities: true,
    extractKeywords: true,
    analyzeSentiment: true
  });
  console.log(result.keywords, result.sentiment, result.entities);
}
```

## Directives

Use `srParse` directive for inline content parsing:

```html
<div [srParse]="content" [srParseOptions]="{ extractEntities: true }"></div>
```

## Components

Use `<sr-content>` component for auto-display:

```html
<sr-content [source]="myContent" [showMetadata]="true" [debug]="false"></sr-content>
```

## Tree-shaking

All exports are tree-shakeable. Use standalone components or import only what you need.

## API Reference

### SemanticraftService

- `parseContent(content, options)` - Full parsing with entities, keywords, sentiment
- `extractEntities(content)` - Extract named entities only
- `extractKeywords(content)` - Extract keywords only
- `analyzeSentiment(content)` - Analyze sentiment only
- `setApiKey(apiKey)` - Update API key
- `setApiUrl(apiUrl)` - Update API URL

### SemanticraftDirective

- `[srParse]` - Content to parse
- `[srParseOptions]` - Parse options

### SemanticraftComponent

- `[source]` - Content source
- `[autoLoad]` - Auto-load on init (default: true)
- `[showMetadata]` - Show keywords/sentiment (default: true)
- `[debug]` - Debug mode (default: false)
- `refresh()` - Reload content

## License

MIT