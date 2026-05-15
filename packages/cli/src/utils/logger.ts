import pc from 'picocolors';

export const logger = {
  info: (msg: string) => console.log(pc.blue('ℹ'), msg),
  success: (msg: string) => console.log(pc.green('✓'), msg),
  warn: (msg: string) => console.log(pc.yellow('⚠'), msg),
  error: (msg: string) => console.log(pc.red('✗'), msg),
  debug: (msg: string) => console.log(pc.gray('▸'), msg),
  dim: (msg: string) => console.log(pc.dim(msg)),
};

export const heading = (msg: string) => console.log(pc.bold(pc.cyan(msg)));

export const section = (msg: string) => console.log(pc.dim('─'.repeat(40)));

export const json = (obj: unknown) => console.log(JSON.stringify(obj, null, 2));