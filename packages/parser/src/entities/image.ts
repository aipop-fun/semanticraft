import { v4 as uuidv4 } from 'uuid';
import type { Entity, ImageEntity } from '../types/entities';

export function extractImages(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const imagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']+)["'])?\)/g;

  let match;
  while ((match = imagePattern.exec(markdown)) !== null) {
    const alt = match[1] || '';
    const url = match[2];
    const caption = match[3];

    const imageEntity: ImageEntity = {
      id: uuidv4(),
      type: 'Image',
      content: caption ? `![${alt}](${url} "${caption}")` : `![${alt}](${url})`,
      normalizedContent: alt.toLowerCase(),
      confidence: 0.95,
      boundingContext: match[0],
      metadata: { extractedFrom: 'markdown_image' },
      url,
      alt,
      caption,
    };

    entities.push(imageEntity);
  }

  return entities;
}