import { readFileSync, watchFile, unwatchFile } from 'fs';
import { parse } from '@semanticraft/parser';
import { logger, json } from '../utils/logger.js';

interface ParseCommandOptions {
  output?: string;
  watch?: boolean;
}

export async function parseCommand(
  input: string | undefined,
  options: ParseCommandOptions
): Promise<void> {
  const content = input
    ? readFileSync(input, 'utf-8')
    : await readStdin();

  if (options.watch && input) {
    logger.info(`Watching ${input} for changes...`);
    watchFile(input, () => {
      logger.info('File changed, re-parsing...');
      try {
        const newContent = readFileSync(input, 'utf-8');
        const result = parse(newContent);
        if (options.output) {
          const { writeFileSync } = await import('fs');
          writeFileSync(options.output, JSON.stringify(result, null, 2));
          logger.success(`Written to ${options.output}`);
        } else {
          json(result);
        }
      } catch (err) {
        logger.error(`Parse failed: ${err}`);
      }
    });
  } else {
    const result = parse(content);
    if (options.output) {
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, JSON.stringify(result, null, 2));
      logger.success(`Written to ${options.output}`);
    } else {
      json(result);
    }
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}