import { parseCommand } from './commands/parse.js';
import { validateCommand } from './commands/validate.js';
import { serveCommand } from './commands/serve.js';
import { initCommand } from './commands/init.js';
import { logger, heading } from './utils/logger.js';

type Command = 'parse' | 'validate' | 'serve' | 'init';

interface CliOptions {
  output?: string;
  watch?: boolean;
  rules?: boolean;
  port?: number;
  dir?: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0] as Command;
  const options: CliOptions = {};
  let input: string | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '--watch') {
      options.watch = true;
    } else if (arg === '--rules') {
      options.rules = true;
    } else if (arg === '--port') {
      options.port = parseInt(args[++i], 10);
    } else if (arg === '--dir') {
      options.dir = args[++i];
    } else if (!arg.startsWith('-')) {
      input = arg;
    }
  }

  switch (command) {
    case 'parse':
      await parseCommand(input, options);
      break;
    case 'validate':
      if (!input) {
        logger.error('validate requires a file argument');
        process.exit(1);
      }
      await validateCommand(input, options);
      break;
    case 'serve':
      await serveCommand(options);
      break;
    case 'init':
      await initCommand(options);
      break;
    case 'help':
      printHelp();
      break;
    default:
      logger.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  heading('Semanticraft CLI');
  console.log(`
  Parse markdown to structured JSON
    semanticraft parse <file|stdin> [-o output.json] [--watch]

  Validate markdown quality
    semanticraft validate <file> [--rules]

  Start local API server
    semanticraft serve [--port 3000]

  Initialize new project
    semanticraft init [--dir .]

  Options:
    -o, --output <file>    Output file path
    --watch                Watch for file changes
    --rules               Show normalizer violations
    --port <number>       Server port (default: 3000)
    --dir <path>         Project directory (default: .)
`);
}

main().catch((err) => {
  logger.error(String(err));
  process.exit(1);
});