import { v4 as uuidv4 } from 'uuid';
import type { Entity, ReviewEntity } from '../types/entities';

export function extractReviews(markdown: string): Entity[] {
  const entities: Entity[] = [];
  const starPattern = /(⭐|⭐️|★|☆|[*]|[0-9]+(?:\.[0-9]+)?(?:\s*\/\s*5))\s*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*5))?(?:\s*[-–—]\s*)?"([^"]+)"/g;

  let match: RegExpExecArray | null;
  while ((match = starPattern.exec(markdown)) !== null) {
    const starsFull = (match[1].match(/⭐|⭐️|★/g) || []).length;
    const ratingStr = match[2] || match[1].replace(/[^0-9.]/g, '');
    const rating = parseFloat(ratingStr) || starsFull;
    const reviewText = match[3];

    const afterMatch = markdown.slice(match.index + match[0].length, match.index + match[0].length + 100);
    const authorMatch = afterMatch.match(/[-–—]\s*([A-Z][a-zA-Z\s]+?)(?:\s*\d|$)/);

    const reviewEntity: ReviewEntity = {
      id: uuidv4(),
      type: 'Review',
      content: `"${reviewText}"`,
      normalizedContent: reviewText.toLowerCase(),
      confidence: 0.85,
      boundingContext: `${match[0].slice(0, 100)}`,
      metadata: { extractedFrom: 'star_rating', starCount: starsFull },
      author: authorMatch ? authorMatch[1].trim() : 'Anonymous',
      rating,
      title: reviewText.slice(0, 50),
      body: reviewText,
    };

    entities.push(reviewEntity);
  }

  const numericPattern = /([0-9]+(?:\.[0-9]+)?)\s*(?:out of)?\s*5\s*(?:stars?)?[^"]*"([^"]+)"/gi;
  while ((match = numericPattern.exec(markdown)) !== null) {
    const rating = parseFloat(match[1]);
    const matchStr = match[0];
    if (rating <= 5 && !entities.some(e => e.boundingContext.includes(matchStr))) {
      const reviewText = match[2];
      const reviewEntity: ReviewEntity = {
        id: uuidv4(),
        type: 'Review',
        content: `"${reviewText}"`,
        normalizedContent: reviewText.toLowerCase(),
        confidence: 0.82,
        boundingContext: match[0],
        metadata: { extractedFrom: 'numeric_rating' },
        author: 'Anonymous',
        rating,
        title: reviewText.slice(0, 50),
        body: reviewText,
      };
      entities.push(reviewEntity);
    }
  }

  return entities;
}