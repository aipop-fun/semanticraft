import { v4 as uuidv4 } from 'uuid';
import type { Entity, SpecificationEntity } from '../types/entities';

export function extractSpecifications(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const tableRowPattern = /\|[^|]+\|\s*[^|]+\|/g;
  const matches = markdown.match(tableRowPattern) || [];

  for (const row of matches) {
    const cells = row.split('|').filter(c => c.trim() && !c.match(/^[\s]*[-─\s]+$/));
    if (cells.length >= 2) {
      const name = cells[0].trim();
      const value = cells[1].trim();

      if (name && value && !name.toLowerCase().includes('spec') && !name.toLowerCase().includes('valor')) {
        const specEntity: SpecificationEntity = {
          id: uuidv4(),
          type: 'Specification',
          content: `${name}: ${value}`,
          normalizedContent: `${name.toLowerCase()} ${value.toLowerCase()}`.replace(/\s+/g, ' '),
          confidence: 0.9,
          boundingContext: row,
          metadata: { extractedFrom: 'table_row' },
          name,
          value,
          comparableValue: parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', '.')) || undefined,
        };

        if (value.match(/\d+\s*(kg|g|cm|m|mm|gb|mb|kb|hz|mhz|ghz|kw|hp)/i)) {
          specEntity.unit = value.match(/\d+\s*(kg|g|cm|m|mm|gb|mb|kb|hz|mhz|ghz|kw|hp)/i)?.[1];
          specEntity.category = 'physical';
        } else if (value.match(/^\d+$/)) {
          specEntity.category = 'performance';
        } else {
          specEntity.category = 'technical';
        }

        entities.push(specEntity);
      }
    }
  }

  return entities;
}