import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SemanticraftService, ParsedContent } from './semanticraft.service';

@Component({
  selector: 'sr-content',
  template: `
    <div class="sr-container" [class.sr-debug]="debug">
      <div class="sr-content" [innerHTML]="parsedHtml"></div>
      <div class="sr-meta" *ngIf="showMetadata">
        <span class="sr-keyword" *ngFor="let kw of keywords">{{ kw }}</span>
        <span class="sr-sentiment" [class]="'sr-' + sentiment">{{ sentiment }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sr-container { font-family: system-ui, sans-serif; }
    .sr-meta { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .sr-keyword { background: #e0e7ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .sr-sentiment { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .sr-positive { background: #dcfce7; color: #166534; }
    .sr-negative { background: #fee2e2; color: #991b1b; }
    .sr-neutral { background: #f3f4f6; color: #374151; }
    .sr-debug { border: 1px dashed #666; padding: 8px; }
    :host ::ng-deep .sr-entity { background: #fef9c3; padding: 0 2px; border-radius: 2px; cursor: help; }
    :host ::ng-deep .sr-entity-person { background: #fce7f3; }
    :host ::ng-deep .sr-entity-organization { background: #dbeafe; }
    :host ::ng-deep .sr-entity-location { background: #dcfce7; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class SemanticraftComponent implements OnInit, OnDestroy {
  @Input() source: string = '';
  @Input() autoLoad: boolean = true;
  @Input() showMetadata: boolean = true;
  @Input() debug: boolean = false;

  parsedHtml: string = '';
  keywords: string[] = [];
  sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private service: SemanticraftService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    if (this.source) {
      await this.loadContent();
    }
    if (this.autoLoad) {
      this.refreshInterval = setInterval(() => this.loadContent(), 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async loadContent(): Promise<void> {
    const content = this.source || document.body.innerText;
    const result = await this.service.parseContent(content, { extractEntities: true, extractKeywords: true, analyzeSentiment: true });
    this.updateDisplay(result);
    this.cdr.markForCheck();
  }

  private updateDisplay(result: ParsedContent): void {
    this.keywords = result.keywords;
    this.sentiment = result.sentiment;
    this.parsedHtml = this.highlightContent(result);
  }

  private highlightContent(result: ParsedContent): string {
    let html = result.text;
    for (const entity of result.entities) {
      const escapedValue = entity.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(escapedValue, 'g'), `<span class="sr-entity sr-entity-${entity.type}">${entity.value}</span>`);
    }
    return html;
  }

  async refresh(): Promise<void> {
    await this.loadContent();
  }
}