interface WorkerMessage {
  id: string;
  markdown: string;
  globalConfig?: {
    debug?: boolean;
  };
}

interface WorkerResponse {
  id: string;
  data?: ParsedContent;
  error?: string;
}

interface ParsedContent {
  title: string;
  content: string;
  excerpt: string;
  headings: string[];
  entities: string[];
}

const md = {
  parse: (text: string) => {
    const tokens: Token[] = [];
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = '';
          tokens.push({ type: 'fence', tag: 'code', content: '', map: [i, i + 1] });
        } else {
          inCodeBlock = false;
          tokens.push({ type: 'fence', tag: 'code', content: codeBlockContent, map: [i, i + 1] });
          codeBlockContent = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }

      const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const tag = `h${level}`;
        const content = headerMatch[2];
        tokens.push({ type: 'heading_open', tag, content: '', map: [i, i + 1] });
        tokens.push({ type: 'inline', content, map: [i, i + 1] });
        tokens.push({ type: 'heading_close', tag, content: '', map: [i, i + 1] });
        continue;
      }

      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s(.+)/);
      if (listMatch) {
        const marker = listMatch[2];
        const content = listMatch[3];
        const tag = marker.match(/\d/) ? 'ol' : 'ul';
        tokens.push({ type: 'bullet_list_open', tag, content: '', map: [i, i + 1] });
        tokens.push({ type: 'list_item_open', tag: 'li', content: '', map: [i, i + 1] });
        tokens.push({ type: 'inline', content, map: [i, i + 1] });
        tokens.push({ type: 'list_item_close', tag: 'li', content: '', map: [i, i + 1] });
        tokens.push({ type: 'bullet_list_close', tag, content: '', map: [i, i + 1] });
        continue;
      }

      const boldMatch = line.match(/\*\*([^*]+)\*\*/);
      if (boldMatch) {
        tokens.push({ type: 'paragraph_open', tag: 'p', content: '', map: [i, i + 1] });
        tokens.push({ type: 'strong_open', tag: 'strong', content: '', map: [i, i + 1] });
        tokens.push({ type: 'inline', content: boldMatch[1], map: [i, i + 1] });
        tokens.push({ type: 'strong_close', tag: 'strong', content: '', map: [i, i + 1] });
        tokens.push({ type: 'paragraph_close', tag: 'p', content: '', map: [i, i + 1] });
        continue;
      }

      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linkMatch) {
        tokens.push({ type: 'paragraph_open', tag: 'p', content: '', map: [i, i + 1] });
        for (const link of linkMatch) {
          const innerMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (innerMatch) {
            tokens.push({ type: 'link_open', tag: 'a', meta: { href: innerMatch[2] }, content: '', map: [i, i + 1] });
            tokens.push({ type: 'inline', content: innerMatch[1], map: [i, i + 1] });
            tokens.push({ type: 'link_close', tag: 'a', meta: { href: innerMatch[2] }, content: '', map: [i, i + 1] });
          }
        }
        tokens.push({ type: 'paragraph_close', tag: 'p', content: '', map: [i, i + 1] });
        continue;
      }

      if (line.trim()) {
        tokens.push({ type: 'paragraph_open', tag: 'p', content: '', map: [i, i + 1] });
        tokens.push({ type: 'inline', content: line, map: [i, i + 1] });
        tokens.push({ type: 'paragraph_close', tag: 'p', content: '', map: [i, i + 1] });
      }
    }

    return tokens;
  },
};

interface Token {
  type: string;
  tag?: string;
  content?: string;
  map?: [number, number];
  meta?: Record<string, unknown>;
}

function extractTitle(tokens: Token[]): string {
  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h1' && token.content) {
      return token.content;
    }
    if (token.type === 'heading_open' && token.tag === 'h1') {
      const next = tokens[tokens.indexOf(token) + 1];
      if (next?.content) return next.content;
    }
  }
  return document.title ?? '';
}

function extractHeadings(tokens: Token[]): string[] {
  const headings: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading_open' && ['h2', 'h3', 'h4'].includes(token.tag ?? '')) {
      const next = tokens[i + 1];
      if (next?.content) {
        headings.push(next.content);
      }
    }
  }
  return headings;
}

function extractExcerpt(markdown: string): string {
  const clean = markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return clean.slice(0, 160);
}

function extractEntities(markdown: string): string[] {
  const entities: string[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = match[2];
    if (!url.startsWith('/') && !url.startsWith('#') && !url.startsWith('mailto:')) {
      entities.push(match[1]);
    }
  }
  return [...new Set(entities)];
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, markdown, globalConfig } = event.data;

  try {
    const tokens = md.parse(markdown);

    const data: ParsedContent = {
      title: extractTitle(tokens),
      content: markdown,
      excerpt: extractExcerpt(markdown),
      headings: extractHeadings(tokens),
      entities: extractEntities(markdown),
    };

    const response: WorkerResponse = { id, data };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = { id, error: (error as Error).message };
    self.postMessage(response);
  }
};

export {};