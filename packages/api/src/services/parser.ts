import type { LLMContent, ParseOptions, ValidationResult } from '@semanticraft/parser';
import { createParser } from '@semanticraft/parser';

const parser = createParser();

export class ParserService {
  async parse(markdown: string, options?: ParseOptions): Promise<LLMContent> {
    return parser.parse(markdown, options);
  }

  async validate(markdown: string): Promise<ValidationResult> {
    return parser.validate(markdown);
  }
}