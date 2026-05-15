import { v4 as uuidv4 } from 'uuid';
import type { Entity, CallToActionEntity } from '../types/entities';

const CTA_INTENTS = ['buy', 'subscribe', 'contact', 'download', 'signup'];

function detectIntent(text: string): CallToActionEntity['intent'] {
  const lower = text.toLowerCase();
  if (lower.includes('compre') || lower.includes('buy') || lower.includes('comprar')) return 'buy';
  if (lower.includes('inscreva') || lower.includes('subscribe') || lower.includes('cadastr')) return 'subscribe';
  if (lower.includes('contato') || lower.includes('contact')) return 'contact';
  if (lower.includes('download') || lower.includes('baixe') || lower.includes('download')) return 'download';
  if (lower.includes('sign') || lower.includes('registro') || lower.includes('criar conta')) return 'signup';
  return 'contact';
}

function detectStyle(text: string): CallToActionEntity['style'] {
  const lower = text.toLowerCase();
  if (lower.includes('botão') || lower.includes('button') || lower.includes('comprar')) return 'primary';
  if (lower.includes('secondary') || lower.includes('secundário')) return 'secondary';
  return 'link';
}

export function extractCallToActions(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  let match;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const text = match[1];
    const url = match[2];

    const isCTA = CTA_INTENTS.some(intent => text.toLowerCase().includes(intent)) ||
      /^(Compre|Buy|Inscreva|Subscribe|Contato|Contact|Download|Baixe|Sign|Signup|Registre)/i.test(text);

    if (isCTA) {
      const ctaEntity: CallToActionEntity = {
        id: uuidv4(),
        type: 'CallToAction',
        content: text,
        normalizedContent: text.toLowerCase(),
        confidence: 0.9,
        boundingContext: match[0],
        metadata: { extractedFrom: 'link', url },
        text,
        url,
        style: detectStyle(text),
        position: 'inline',
        intent: detectIntent(text),
      };
      entities.push(ctaEntity);
    }
  }

  return entities;
}