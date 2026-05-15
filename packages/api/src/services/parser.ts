import type { LLMContent, ParseOptions, ValidationResult } from '@semanticraft/parser';
import { createParser } from '@semanticraft/parser';
import { cacheService } from './cache.js';

const parser = createParser();

export class ParserService {
  async parse(markdown: string, options?: ParseOptions): Promise<LLMContent> {
    const contentHash = cacheService.getContentHash(markdown);
    const cacheKey = cacheService.buildCacheKey(contentHash);

    const cached = await cacheService.get<LLMContent>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await parser.parse(markdown, options);
    await cacheService.set(cacheKey, result);

    return result;
  }

  async validate(markdown: string): Promise<ValidationResult> {
    return parser.validate(markdown);
  }

  async invalidateCache(markdown: string): Promise<void> {
    const contentHash = cacheService.getContentHash(markdown);
    const cacheKey = cacheService.buildCacheKey(contentHash);
    await cacheService.invalidate(cacheKey);
  }
}

export const parserService = new ParserService();