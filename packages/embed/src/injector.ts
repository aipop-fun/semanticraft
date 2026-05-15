export interface JsonLdData {
  title?: string;
  content?: string;
  excerpt?: string;
  headings?: string[];
  entities?: string[];
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  url?: string;
}

export interface InjectorConfig {
  debug?: boolean;
  forceOverride?: boolean;
  placement?: 'head' | 'body';
}

export class JsonLdInjector {
  private config: InjectorConfig;
  private scriptSelector = 'script[data-semanticraft]';

  constructor(config: InjectorConfig = {}) {
    this.config = {
      debug: config.debug ?? false,
      forceOverride: config.forceOverride ?? true,
      placement: config.placement ?? 'head',
    };
  }

  public inject(data: JsonLdData): HTMLScriptElement | null {
    this.removeExisting();

    const jsonLd = this.buildJsonLd(data);
    const script = this.createScriptElement(jsonLd);

    const target = this.config.placement === 'head'
      ? document.querySelector('head')
      : document.body;

    if (!target) {
      this.log('No target element found for injection');
      return null;
    }

    target.appendChild(script);
    this.log('JSON-LD injected successfully');
    return script;
  }

  private buildJsonLd(data: JsonLdData): object {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
    };

    const articleSchema: Record<string, unknown> = {
      ...baseSchema,
      headline: data.title ?? '',
      articleBody: data.content?.slice(0, 5000) ?? '',
      text: data.excerpt ?? '',
    };

    if (data.headings?.length) {
      articleSchema.about = data.headings.map((h) => ({
        '@type': 'Thing',
        name: h,
      }));
    }

    if (data.entities?.length) {
      articleSchema.keywords = data.entities.slice(0, 10).join(', ');
    }

    if (data.author) {
      articleSchema.author = {
        '@type': 'Person',
        name: data.author,
      };
    }

    if (data.publishedDate) {
      articleSchema.datePublished = data.publishedDate;
    }

    if (data.modifiedDate) {
      articleSchema.dateModified = data.modifiedDate;
    }

    if (data.url) {
      articleSchema.url = data.url;
    }

    return articleSchema;
  }

  private createScriptElement(jsonLd: object): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-semanticraft', 'true');
    script.textContent = JSON.stringify(jsonLd, null, 2);
    return script;
  }

  public removeExisting(): void {
    const existing = document.querySelector(this.scriptSelector);
    if (existing) {
      existing.remove();
      this.log('Removed existing JSON-LD script');
    }
  }

  public getInjectedScript(): HTMLScriptElement | null {
    return document.querySelector(this.scriptSelector) as HTMLScriptElement | null;
  }

  public getInjectedData(): JsonLdData | null {
    const script = this.getInjectedScript();
    if (!script) return null;

    try {
      return JSON.parse(script.textContent ?? '{}') as JsonLdData;
    } catch {
      return null;
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[semanticraft:injector]', ...args);
    }
  }

  public updateConfig(config: Partial<InjectorConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export function injectJsonLd(data: JsonLdData, config?: InjectorConfig): HTMLScriptElement | null {
  const injector = new JsonLdInjector(config);
  return injector.inject(data);
}

export function removeJsonLd(): void {
  const injector = new JsonLdInjector();
  injector.removeExisting();
}

export function getInjectedJsonLd(): JsonLdData | null {
  const injector = new JsonLdInjector();
  return injector.getInjectedData();
}