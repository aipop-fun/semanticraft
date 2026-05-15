import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { SemanticraftService } from './semanticraft.service';

@Directive({
  selector: '[srParse]',
  standalone: false
})
export class SemanticraftDirective implements OnInit, OnDestroy {
  @Input('srParse') content: string = '';
  @Input() srParseOptions: { extractEntities?: boolean; extractKeywords?: boolean; analyzeSentiment?: boolean } = {};

  private observer: MutationObserver | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private service: SemanticraftService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.parseAndDecorate();
    this.setupMutationObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private async parseAndDecorate(): Promise<void> {
    const textToParse = this.content || this.el.nativeElement.textContent;
    const result = await this.service.parseContent(textToParse, this.srParseOptions);

    this.highlightEntities(result.entities);
    this.addMetadata(result);
  }

  private highlightEntities(entities: { type: string; value: string; confidence: number }[]): void {
    let html = this.el.nativeElement.innerHTML;
    for (const entity of entities) {
      const marker = `<span class="sr-entity sr-entity-${entity.type}" title="${entity.type}: ${entity.confidence}">${entity.value}</span>`;
      html = html.replace(entity.value, marker);
    }
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
  }

  private addMetadata(result: { entities: unknown[]; keywords: string[]; sentiment: string }): void {
    this.el.nativeElement.dataset.srEntities = JSON.stringify(result.entities);
    this.el.nativeElement.dataset.srKeywords = JSON.stringify(result.keywords);
    this.el.nativeElement.dataset.srSentiment = result.sentiment;
  }

  private setupMutationObserver(): void {
    this.observer = new MutationObserver(() => {
      this.parseAndDecorate();
    });
    this.observer.observe(this.el.nativeElement, { childList: true, subtree: true });
  }
}