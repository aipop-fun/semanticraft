import { writeFileSync, mkdirSync } from 'fs';
import { logger, heading, success } from '../utils/logger.js';

interface InitCommandOptions {
  dir?: string;
}

const CONFIG_TEMPLATE = `{
  "semanticraft": {
    "version": "1.0.0",
    "rules": {
      "maxHeadingLevel": 6,
      "allowHtml": false,
      "normalizeWhitespace": true
    },
    "entities": {
      "extractQuotes": true,
      "extractNavigation": true,
      "extractCodeBlocks": true,
      "extractImages": true,
      "extractCallToAction": true,
      "extractReviews": true,
      "extractSpecifications": true
    },
    "relationships": {
      "resolveInternalLinks": true,
      "extractContextual": true
    }
  }
}
`;

const README_TEMPLATE = `# Semanticraft Project

This project uses semanticraft to parse and analyze markdown content.

## Commands

\`\`\`bash
# Parse a markdown file
semanticraft parse input.md -o output.json

# Validate markdown quality
semanticraft validate input.md

# Start API server
semanticraft serve --port 3000
\`\`\`

## Configuration

Edit \`semanticraft.config.json\` to customize parser behavior.
`;

export async function initCommand(options: InitCommandOptions): Promise<void> {
  const dir = options.dir || '.';

  try {
    mkdirSync(dir, { recursive: true });

    writeFileSync(`${dir}/semanticraft.config.json`, CONFIG_TEMPLATE);
    logger.success('Created semanticraft.config.json');

    writeFileSync(`${dir}/README.md`, README_TEMPLATE);
    logger.success('Created README.md');

    heading('Project initialized!');
    console.log(`  Config: ${dir}/semanticraft.config.json`);
    console.log(`  README: ${dir}/README.md\n`);
    success('Ready to parse markdown');
  } catch (err) {
    logger.error(`Failed to initialize: ${err}`);
    process.exit(1);
  }
}