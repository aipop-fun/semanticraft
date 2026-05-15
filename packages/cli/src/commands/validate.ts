import { readFileSync } from 'fs';
import { parse } from '@semanticraft/parser';
import { logger, heading, section } from '../utils/logger.js';

interface ValidateCommandOptions {
  rules?: boolean;
}

const NORMALIZER_RULES = [
  { pattern: /\n{3,}/g, message: 'Multiple consecutive newlines detected' },
  { pattern: /^\s+$/gm, message: 'Lines with only whitespace' },
  { pattern: /#{7,}/g, message: 'Heading levels should be 1-6' },
  { pattern: /\[.*\]\(.*\)/g, message: 'Links should have descriptive text' },
];

export async function validateCommand(
  file: string,
  options: ValidateCommandOptions
): Promise<void> {
  const content = readFileSync(file, 'utf-8');
  const result = parse(content);

  heading('Validation Report');
  console.log(`File: ${file}\n`);
  section('');

  let issueCount = 0;

  if (result.warnings && result.warnings.length > 0) {
    logger.warn(`${result.warnings.length} parser warning(s):`);
    result.warnings.forEach((w: string) => {
      console.log(`  • ${w}`);
      issueCount++;
    });
    console.log();
  }

  if (options.rules) {
    heading('Normalizer Rules Check');
    NORMALIZER_RULES.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        logger.warn(message);
        console.log(`  Found: ${matches.length} occurrence(s)`);
        issueCount++;
      }
    });
    console.log();
  }

  const issues = countIssues(result);
  if (issues === 0) {
    logger.success('No issues detected');
  } else {
    logger.error(`Total issues: ${issues}`);
    process.exit(1);
  }
}

function countIssues(result: { warnings?: string[] }): number {
  return (result.warnings?.length || 0);
}