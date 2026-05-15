# Angular Integration

Guia de uso do `@semanticraft/angular`.

## Instalação

```bash
npm install @semanticraft/angular
```

## Configuração

### Module

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SemanticraftModule } from '@semanticraft/angular';

@NgModule({
  imports: [
    BrowserModule,
    SemanticraftModule.forRoot({
      apiKey: 'your-api-key',
      autoParse: true,
    }),
  ],
})
export class AppModule {}
```

### Standalone Components

```typescript
import { Component } from '@angular/core';
import { SemanticraftDirective } from '@semanticraft/angular';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [SemanticraftDirective],
  template: `
    <div [semanticraft]="markdown">
      <ng-template #semanticraftTemplate let-result>
        <h1>{{ result.intent.primary }}</h1>
        <p>Confidence: {{ result.confidence.overall }}</p>
      </ng-template>
    </div>
  `,
})
export class ProductComponent {
  markdown = '# Produto\n\n**Preço:** R$ 99';
}
```

## Services

### SemanticraftService

```typescript
import { Injectable } from '@angular/core';
import { SemanticraftService } from '@semanticraft/angular';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private semanticraft: SemanticraftService) {}

  async parseContent(markdown: string) {
    return this.semanticraft.parse(markdown);
  }
}
```

### Métodos do Service

```typescript
const result = await semanticraft.parse(markdown);
const entities = semanticraft.getEntitiesByType(result, 'Product');
const validation = semanticraft.validate(result);
```

## Directives

### semanticraft Directive

```html
<div [semanticraft]="markdown" [options]="options">
  <ng-template #loading>Parsing...</ng-template>
  <ng-template #error let-error>{{ error }}</ng-template>
  <ng-template #success let-result>
    <span>{{ result.intent.primary }}</span>
  </ng-template>
</div>
```

### semanticraftEntities Pipe

```html
@for (entity of entities | semanticraftEntities:'Product'; track entity.id) {
  <app-entity-card [entity]="entity" />
}
```

### semanticraftIntent Pipe

```html
<span>{{ intent | semanticraftIntent:'primary' }}</span>
```

## Components

### sf-entity-card

```html
<sf-entity-card
  [entity]="entity"
  [showConfidence]="true"
  [showContext]="false"
/>
```

### sf-json-ld

```html
<sf-json-ld [schema]="schema"></sf-json-ld>
```

### sf-confidence-badge

```html
<sf-confidence-badge
  [score]="confidence"
  [showFactors]="true"
/>
```

## Exemplo Completo

### Component

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SemanticraftModule } from '@semanticraft/angular';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, SemanticraftModule],
  template: `
    <article>
      <div [semanticraft]="markdown" [options]="options">
        <ng-template #loading>
          <p>Carregando...</p>
        </ng-template>

        <ng-template #error let-error>
          <p>Erro: {{ error }}</p>
        </ng-template>

        <ng-template #success let-result>
          <header>
            <h1>Intent: {{ result.intent.primary }}</h1>
            <span>Confiança: {{ result.confidence.overall }}</span>
          </header>

          <section>
            @for (product of result.entities | semanticraftEntities:'Product'; track product.id) {
              <sf-entity-card [entity]="product" />
            }
          </section>

          <aside>
            @for (offer of result.entities | semanticraftEntities:'Offer'; track offer.id) {
              <price>R$ {{ offer.price }}</price>
            }
          </aside>
        </ng-template>
      </div>
    </article>
  `,
})
export class ProductComponent {
  markdown = `
# iPhone 15 Pro

**Preço:** R$ 9.499

Tela de 6.7 polegadas.
  `;

  options = {
    confidenceThreshold: 0.5,
    extractImages: true,
  };
}
```

### Service com Cache

```typescript
import { Injectable } from '@angular/core';
import { SemanticraftService } from '@semanticraft/angular';
import { Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private cache = new Map<string, Observable<any>>();

  constructor(private semanticraft: SemanticraftService) {}

  parseContent(markdown: string): Observable<any> {
    const key = this.hashMarkdown(markdown);

    if (!this.cache.has(key)) {
      const result = from(this.semanticraft.parse(markdown));
      this.cache.set(key, result.pipe(shareReplay(1)));
    }

    return this.cache.get(key);
  }

  private hashMarkdown(markdown: string): string {
    return btoa(markdown).substring(0, 32);
  }
}
```

## Troubleshooting

### ERRO: Module not found

Verifique se o Angular é >= 14:

```bash
ng version
```

### ERRO: Expression has changed

Use `ChangeDetectionStrategy.OnPush` e dispare parse manualmente:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  onContentChange() {
    this.semanticraft.parse(this.markdown).then(() => {
      this.cdr.markForCheck();
    });
  }
}
```