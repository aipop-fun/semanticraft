import { v4 as uuidv4 } from 'uuid';
import type { Entity, QuoteEntity } from '../types/entities';

export function extractQuotes(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const quotePattern = /^>\s*(.+?)(?:\n|$)/gm;

  let match;
  let currentQuote = '';
  let lastIndex = 0;

  while ((match = quotePattern.exec(markdown)) !== null) {
    if (match.index === lastIndex + currentQuote.length + 1 || lastIndex === 0) {
      currentQuote += (currentQuote ? ' ' : '') + match[1];
      lastIndex = match.index;
    } else {
      if (currentQuote) {
        const quoteEntity = createQuoteEntity(currentQuote, markdown);
        if (quoteEntity) entities.push(quoteEntity);
      }
      currentQuote = match[1];
      lastIndex = match.index;
    }
  }

  if (currentQuote) {
    const quoteEntity = createQuoteEntity(currentQuote, markdown);
    if (quoteEntity) entities.push(quoteEntity);
  }

  return entities;
}

function createQuoteEntity(text: string, _fullMarkdown: string): QuoteEntity | null {
  if (!text.trim()) return null;

  const dashMatch = text.match(/[-–—]\s*([A-Z][a-zA-Z\s]+?)(?:\s*$)/);
  const author = dashMatch ? dashMatch[1].trim() : undefined;
  const quoteText = author ? text.replace(/[-–—]\s*$/, '').replace(/[-–—]\s*[A-Z][a-zA-Z\s]+?$/, '').trim() : text;

  const quoteEntity: QuoteEntity = {
    id: uuidv4(),
    type: 'Quote',
    content: text,
    normalizedContent: quoteText.toLowerCase(),
    confidence: 0.88,
    boundingContext: text.slice(0, 100),
    metadata: { extractedFrom: 'blockquote' },
    text: quoteText,
    author,
  };

  return quoteEntity;
}