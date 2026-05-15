import { v4 as uuidv4 } from 'uuid';
import type { Entity, CodeBlockEntity } from '../types/entities';

export function extractCodeBlocks(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const codeBlockPattern = /```(\w*)\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockPattern.exec(markdown)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();

    const codeEntity: CodeBlockEntity = {
      id: uuidv4(),
      type: 'CodeBlock',
      content: match[0],
      normalizedContent: code.toLowerCase(),
      confidence: 0.98,
      boundingContext: match[0].slice(0, 100),
      metadata: { extractedFrom: 'fenced_code_block', language },
      language,
      code,
    };

    entities.push(codeEntity);
  }

  return entities;
}