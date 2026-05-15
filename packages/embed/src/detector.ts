export interface DetectionResult {
  element: Element;
  score: number;
  indicators: string[];
}

export class MarkdownDetector {
  private selectors: string[];
  private minScore: number;

  constructor(selectors: string[] = ['article', '[role="main"]', 'main', '.content', '#content']) {
    this.selectors = selectors;
    this.minScore = 2;
  }

  public detect(): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const selector of this.selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const analysis = this.analyzeElement(element);
        if (analysis.score >= this.minScore) {
          results.push({ element, ...analysis });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private analyzeElement(element: Element): Omit<DetectionResult, 'element'> {
    const text = element.textContent ?? '';
    const indicators: string[] = [];
    let score = 0;

    if (this.hasHeadingPattern(text)) {
      score += 3;
      indicators.push('has_headings');
    }

    if (this.hasBoldPattern(text)) {
      score += 2;
      indicators.push('has_bold');
    }

    if (this.hasItalicPattern(text)) {
      score += 1;
      indicators.push('has_italic');
    }

    if (this.hasListPattern(text)) {
      score += 2;
      indicators.push('has_lists');
    }

    if (this.hasLinkPattern(text)) {
      score += 2;
      indicators.push('has_links');
    }

    if (this.hasCodePattern(text)) {
      score += 2;
      indicators.push('has_code');
    }

    if (this.hasBlockquotePattern(text)) {
      score += 1;
      indicators.push('has_blockquotes');
    }

    if (this.hasHorizontalRulePattern(text)) {
      score += 1;
      indicators.push('has_hr');
    }

    const linkDensity = this.calculateLinkDensity(element);
    if (linkDensity > 0.05 && linkDensity < 0.5) {
      score += 1;
      indicators.push('healthy_link_density');
    }

    return { score, indicators };
  }

  private hasHeadingPattern(text: string): boolean {
    return /^#{1,6}\s+.+$/m.test(text);
  }

  private hasBoldPattern(text: string): boolean {
    return /\*\*[^*]+\*\*/.test(text) || /__[^_]+__/.test(text);
  }

  private hasItalicPattern(text: string): boolean {
    return /\*[^*]+\*/.test(text) || /_[^_]+_/.test(text);
  }

  private hasListPattern(text: string): boolean {
    return /^\s*[-*+]\s+.+$/m.test(text) || /^\s*\d+\.\s+.+$/m.test(text);
  }

  private hasLinkPattern(text: string): boolean {
    return /\[.+\]\(.+\)/.test(text);
  }

  private hasCodePattern(text: string): boolean {
    return /`[^`]+`/.test(text) || /```[\s\S]*?```/.test(text);
  }

  private hasBlockquotePattern(text: string): boolean {
    return /^>\s+.+$/m.test(text);
  }

  private hasHorizontalRulePattern(text: string): boolean {
    return /^[-*_]{3,}$/m.test(text);
  }

  private calculateLinkDensity(element: Element): number {
    const links = element.querySelectorAll('a');
    const textLength = (element.textContent ?? '').length;
    if (textLength === 0) return 0;

    const linkTextLength = Array.from(links).reduce((acc, link) => acc + (link.textContent ?? '').length, 0);
    return linkTextLength / textLength;
  }

  public setMinScore(score: number): void {
    this.minScore = score;
  }

  public addSelector(selector: string): void {
    this.selectors.push(selector);
  }
}

export function detectMarkdownElements(customSelectors?: string[]): Element[] {
  const detector = new MarkdownDetector(customSelectors);
  return detector.detect().map((r) => r.element);
}

export function getDetectionDetails(element: Element): DetectionResult | null {
  const detector = new MarkdownDetector();
  const results = detector.detect();
  return results.find((r) => r.element === element) ?? null;
}