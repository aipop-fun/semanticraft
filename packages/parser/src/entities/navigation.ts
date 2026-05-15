import { v4 as uuidv4 } from 'uuid';
import type { Entity, NavigationEntity } from '../types/entities';

export function extractNavigation(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const headingPattern = /^(#{1,3})\s+.*?\[([^\]]+)\]\(([^)\s]+)\)/gm;
  const listLinkPattern = /^[\s]*[-*+]\s+\[([^\]]+)\]\(([^)\s]+)\)/gm;

  let position = 0;

  let match;
  while ((match = headingPattern.exec(markdown)) !== null) {
    const name = match[2];
    const url = match[3];

    const navEntity: NavigationEntity = {
      id: uuidv4(),
      type: 'Navigation',
      content: match[0],
      normalizedContent: name.toLowerCase(),
      confidence: 0.9,
      boundingContext: match[0],
      metadata: { extractedFrom: 'heading_link', headingLevel: match[1].length },
      name,
      url,
      position: position++,
    };

    entities.push(navEntity);
  }

  while ((match = listLinkPattern.exec(markdown)) !== null) {
    const name = match[1];
    const url = match[2];

    const navEntity: NavigationEntity = {
      id: uuidv4(),
      type: 'Navigation',
      content: match[0],
      normalizedContent: name.toLowerCase(),
      confidence: 0.85,
      boundingContext: match[0],
      metadata: { extractedFrom: 'list_link' },
      name,
      url,
      position: position++,
    };

    entities.push(navEntity);
  }

  return entities;
}