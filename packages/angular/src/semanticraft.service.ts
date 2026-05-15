import { Injectable, Inject } from '@angular/core';

export interface ParsedContent {
  text: string;
  entities: Entity[];
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface ParseOptions {
  extractEntities?: boolean;
  extractKeywords?: boolean;
  analyzeSentiment?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SemanticraftService {
  private apiUrl: string;
  private apiKey: string;
  private debug: boolean;

  constructor(@Inject('SEMANTICCRAFT_CONFIG') private config: { apiUrl?: string; apiKey?: string; debug?: boolean }) {
    this.apiUrl = config.apiUrl || 'https://api.semanticraft.io';
    this.apiKey = config.apiKey || '';
    this.debug = config.debug || false;
  }

  async parseContent(content: string, options: ParseOptions = {}): Promise<ParsedContent> {
    if (this.debug) {
      console.log('[SemanticraftService] Parsing content:', content.substring(0, 100));
    }

    const payload = {
      content,
      extractEntities: options.extractEntities ?? true,
      extractKeywords: options.extractKeywords ?? true,
      analyzeSentiment: options.analyzeSentiment ?? true
    };

    const response = await fetch(`${this.apiUrl}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Semanticraft API error: ${response.status}`);
    }

    return response.json();
  }

  async extractEntities(content: string): Promise<Entity[]> {
    const result = await this.parseContent(content, { extractEntities: true, extractKeywords: false, analyzeSentiment: false });
    return result.entities;
  }

  async extractKeywords(content: string): Promise<string[]> {
    const result = await this.parseContent(content, { extractEntities: false, extractKeywords: true, analyzeSentiment: false });
    return result.keywords;
  }

  async analyzeSentiment(content: string): Promise<'positive' | 'negative' | 'neutral'> {
    const result = await this.parseContent(content, { extractEntities: false, extractKeywords: false, analyzeSentiment: true });
    return result.sentiment;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  setApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }
}