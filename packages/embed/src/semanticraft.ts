import MarkdownIt from 'markdown-it';

export interface SemanticraftConfig {
  selectors?: string[];
  debug?: boolean;
  autoInject?: boolean;
  workerEnabled?: boolean;
}

export interface SemanticraftWindow {
  semanticraft?: SemanticraftConfig;
}

declare global {
  interface Window {
    semanticraft?: SemanticraftConfig;
    SemanticraftEmbed?: typeof SemanticraftEmbed;
  }
}

interface ParsedContent {
  title: string;
  content: string;
  excerpt: string;
  headings: string[];
  entities: string[];
}

class SemanticraftEmbed {
  private config: Required<SemanticraftConfig>;
  private md: MarkdownIt;
  private worker: Worker | null = null;
  private parsedData: Map<string, ParsedContent> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    this.initWorker();
    this.boot();
  }

  private loadConfig(): Required<SemanticraftConfig> {
    const win = window as SemanticraftWindow;
    return {
      selectors: win.semanticraft?.selectors ?? ['article', '[role="main"]', 'main', '.content', '#content'],
      debug: win.semanticraft?.debug ?? false,
      autoInject: win.semanticraft?.autoInject ?? true,
      workerEnabled: win.semanticraft?.workerEnabled ?? true,
    };
  }

  private initWorker(): void {
    if (!this.config.workerEnabled || typeof Worker === 'undefined') {
      return;
    }

    const workerCode = this.createWorkerCode();
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(workerUrl);

    this.worker.onmessage = (event) => {
      const { id, data } = event.data;
      this.parsedData.set(id, data);
      if (this.config.autoInject) {
        this.injectJsonLd(data);
      }
    };

    this.worker.onerror = (error) => {
      this.log('Worker error:', error);
    };
  }

  private createWorkerCode(): string {
    return `
      self.onmessage = function(e) {
        const { id, markdown, globalConfig } = e.data;
        try {
          const md = require('markdown-it')({ html: true, linkify: true, typographer: true });
          const tokens = md.parse(markdown, {});
          const title = extractTitle(tokens);
          const headings = extractHeadings(tokens);
          const excerpt = extractExcerpt(markdown);
          const entities = extractEntities(markdown);
          self.postMessage({ id, data: { title, content: markdown, excerpt, headings, entities } });
        } catch (err) {
          self.postMessage({ id, error: err.message });
        }
      };

      function extractTitle(tokens) {
        for (const token of tokens) {
          if (token.type === 'heading_open' && token.tag === 'h1') {
            const next = tokens[tokens.indexOf(token) + 1];
            return next?.content ?? '';
          }
        }
        return document.title ?? '';
      }

      function extractHeadings(tokens) {
        const headings = [];
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === 'heading_open' && ['h2', 'h3', 'h4'].includes(token.tag)) {
            const next = tokens[i + 1];
            if (next?.content) headings.push(next.content);
          }
        }
        return headings;
      }

      function extractExcerpt(markdown) {
        const clean = markdown.replace(/#{1,6}\\s/g, '').replace(/\\*\\*|__/g, '').replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1');
        return clean.slice(0, 160).trim();
      }

      function extractEntities(markdown) {
        const entities = [];
        const linkPattern = /\\[([^\\]]+)\\]\\(([^)]+)\\)/g;
        let match;
        while ((match = linkPattern.exec(markdown)) !== null) {
          if (match[2].startsWith('/') || match[2].startsWith('#')) continue;
          entities.push(match[1]);
        }
        return [...new Set(entities)];
      }
    `;
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[semanticraft]', ...args);
    }
  }

  private boot(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.run());
    } else {
      this.run();
    }
  }

  private run(): void {
    this.log('Booting Semanticraft Embed');
    const sections = this.detectSections();
    if (sections.length === 0) {
      this.log('No markdown content detected');
      return;
    }
    this.log(`Detected ${sections.length} content sections`);
    this.processSections(sections);
  }

  private detectSections(): Element[] {
    const sections: Element[] = [];
    for (const selector of this.config.selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const text = el.textContent ?? '';
        if (this.looksLikeMarkdown(text)) {
          sections.push(el);
        }
      });
    }
    return sections;
  }

  private looksLikeMarkdown(text: string): boolean {
    const patterns = [/^#{1,6}\s/m, /\*\*[^*]+\*\*/, /__[^_]+__/, /^\s*[-*+]\s/m, /^\s*\d+\.\s/m, /\[.+\]\(.+\)/, /```[\s\S]*?```/];
    const score = patterns.reduce((acc, pattern) => acc + (pattern.test(text) ? 1 : 0), 0);
    return score >= 2;
  }

  private processSections(sections: Element[]): void {
    sections.forEach((section, index) => {
      const id = `semanticraft-${index}-${Date.now()}`;
      const markdown = section.textContent ?? '';

      if (this.worker && this.config.workerEnabled) {
        this.worker.postMessage({ id, markdown, globalConfig: this.config });
      } else {
        this.parseSync(section, id, markdown);
      }
    });
  }

  private parseSync(element: Element, id: string, markdown: string): void {
    const tokens = this.md.parse(markdown, {});
    const title = this.extractTitle(tokens);
    const headings = this.extractHeadings(tokens);
    const excerpt = this.extractExcerpt(markdown);
    const entities = this.extractEntities(markdown);

    const data: ParsedContent = { title, content: markdown, excerpt, headings, entities };
    this.parsedData.set(id, data);

    if (this.config.autoInject) {
      this.injectJsonLd(data);
    }
  }

  private extractTitle(tokens: ReturnType<MarkdownIt['parse']>): string {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open' && token.tag === 'h1') {
        const next = tokens[i + 1];
        return next?.content ?? '';
      }
    }
    return document.title ?? '';
  }

  private extractHeadings(tokens: ReturnType<MarkdownIt['parse']>): string[] {
    const headings: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open' && ['h2', 'h3', 'h4'].includes(token.tag ?? '')) {
        const next = tokens[i + 1];
        if (next?.content) headings.push(next.content);
      }
    }
    return headings;
  }

  private extractExcerpt(markdown: string): string {
    const clean = markdown
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*|__/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    return clean.slice(0, 160).trim();
  }

  private extractEntities(markdown: string): string[] {
    const entities: string[] = [];
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(markdown)) !== null) {
      if (match[2].startsWith('/') || match[2].startsWith('#')) continue;
      entities.push(match[1]);
    }
    return [...new Set(entities)];
  }

  private injectJsonLd(data: ParsedContent): void {
    const existing = document.querySelector('script[data-semanticraft]');
    if (existing) existing.remove();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      articleBody: data.content.slice(0, 5000),
      text: data.excerpt,
      about: data.entities.map((e) => ({ '@type': 'Thing', name: e })),
      author: { '@type': 'Organization', name: document.querySelector('meta[name="author"]')?.getAttribute('content') ?? 'Unknown' },
      datePublished: document.querySelector('meta[property="article:published_time"]')?.getAttribute('content'),
      dateModified: document.querySelector('meta[property="article:modified_time"]')?.getAttribute('content'),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-semanticraft', 'true');
    script.textContent = JSON.stringify(jsonLd, null, 2);

    const head = document.querySelector('head') ?? document.documentElement;
    head.appendChild(script);
    this.log('JSON-LD injected', jsonLd);
  }

  public getParsedData(): Map<string, ParsedContent> {
    return this.parsedData;
  }

  public destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.parsedData.clear();
    document.querySelector('script[data-semanticraft]')?.remove();
  }
}

const init = () => {
  if (window.SemanticraftEmbed) return;
  window.SemanticraftEmbed = SemanticraftEmbed;
  new SemanticraftEmbed();
};

if (typeof window !== 'undefined') {
  init();
}

export { SemanticraftEmbed, init };
export default SemanticraftEmbed;