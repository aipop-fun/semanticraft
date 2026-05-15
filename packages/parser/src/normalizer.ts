export function normalize(markdown: string): string {
  let result = markdown;
  result = normalizeFrontmatter(result);
  result = normalizeDeeplyNestedLists(result);
  result = normalizeTablesWithoutHeaders(result);
  result = normalizeCodeBlocksWithMixedSyntax(result);
  result = normalizeReferenceStyleLinks(result);
  result = normalizeHeadersInsideCodeBlocks(result);
  result = normalizeNestedBlockquotes(result);
  result = normalizeHorizontalRuleSeparators(result);
  result = normalizeMixedEmphasis(result);
  result = normalizeNonStandardImageSyntax(result);
  return result;
}

function normalizeFrontmatter(input: string): string {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = input.match(frontmatterRegex);
  if (!match) return input;
  return input.replace(frontmatterRegex, '');
}

function normalizeDeeplyNestedLists(input: string): string {
  const lines = input.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (!listMatch) {
      result.push(line);
      continue;
    }
    const [, indent, marker, content] = listMatch;
    const level = Math.floor(indent.length / 2) + 1;
    if (level > 3) {
      result.push(`${indent}[nested:level-${level}] ${marker} ${content}`);
    } else {
      result.push(line);
    }
  }
  return result.join('\n');
}

function normalizeTablesWithoutHeaders(input: string): string {
  const tableRegex = /^\|(.+)\|(\n\|[-: |]+\|)?(\n(?:\|.+\|))*$/gm;
  return input.replace(tableRegex, (match) => {
    const rows = match.split('\n').filter(row => row.trim());
    if (rows.length === 0) return match;
    const firstRow = rows[0];
    const cols = firstRow.split('|').filter(c => c.trim());
    const hasHeader = rows.length > 1 && rows[1].includes('---');
    if (!hasHeader) {
      const colNames = cols.map((_, i) => `Col_${i + 1}`);
      const separator = cols.map(() => '---').join('|');
      return `|${colNames.join('|')}|\n|${separator}|\n${rows.join('\n')}`;
    }
    return match;
  });
}

function normalizeCodeBlocksWithMixedSyntax(input: string): string {
  const codeBlockRegex = /^(```)(\w*)(\s*\n)([\s\S]*?)(\n```)$/gm;
  return input.replace(codeBlockRegex, (match, open, lang, newline, content, close) => {
    const hasMultipleLangs = /`{3}/.test(content);
    if (hasMultipleLangs && !lang) {
      return `${open}mixed${newline}${content}${close}`;
    }
    return match;
  });
}

function normalizeReferenceStyleLinks(input: string): string {
  const refDefs: Record<string, string> = {};
  const refDefRegex = /^\[([^\]]+)\]:\s*(.+?)(?:\s+"([^"]*)")?\s*$/gm;
  let defMatch;
  while ((defMatch = refDefRegex.exec(input)) !== null) {
    refDefs[defMatch[1]] = defMatch[2];
  }
  let result = input.replace(refDefRegex, '');
  const inlineLinkRegex = /\[([^\]]+)\]\[([^\]]+)\]/g;
  result = result.replace(inlineLinkRegex, (_, text, ref) => {
    const url = refDefs[ref];
    return url ? `[${text}](${url})` : `[${text}][${ref}]`;
  });
  const shortcutRefRegex = /\[([^\]]+)\]\[\]/g;
  result = result.replace(shortcutRefRegex, (_, text) => {
    const url = refDefs[text];
    return url ? `[${text}](${url})` : `[${text}]`;
  });
  return result;
}

function normalizeHeadersInsideCodeBlocks(input: string): string {
  const codeBlockRegex = /(^```[\w]*\n)([\s\S]*?)(\n```)$/gm;
  return input.replace(codeBlockRegex, (_match, open, content, close) => {
    const lines = content.split('\n');
    const normalized = lines.map((line: string) => {
      if (/^#{1,6}\s/.test(line)) {
        return `isCodeContent: true | ${line}`;
      }
      return line;
    });
    return open + normalized.join('\n') + close;
  });
}

function normalizeNestedBlockquotes(input: string): string {
  const lines = input.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const bqMatch = line.match(/^(\s*>+\s?)(.*)$/);
    if (!bqMatch) {
      result.push(line);
      continue;
    }
    const [, marker, content] = bqMatch;
    const level = (marker.match(/>/g) || []).length;
    if (level > 1) {
      result.push(`[nested:level-${level}]${marker}${content}`);
    } else {
      result.push(line);
    }
  }
  return result.join('\n');
}

function normalizeHorizontalRuleSeparators(input: string): string {
  const hrRegex = /^(?:[-*_]\s*){3,}\s*$/gm;
  return input.replace(hrRegex, '\n<!-- hr -->\n');
}

function normalizeMixedEmphasis(input: string): string {
  const boldItalicRegex = /\*\*\*([^*]+)\*\*\*/g;
  let result = input.replace(boldItalicRegex, '_$1_');
  const italicBoldRegex = /\*\*(.+?)\*\*/g;
  result = result.replace(italicBoldRegex, '$1');
  const underItalicBoldRegex = /___(.+?)___/g;
  result = result.replace(underItalicBoldRegex, '_$1_');
  const underBoldRegex = /__(.+?)__/g;
  result = result.replace(underBoldRegex, '$1');
  return result;
}

function normalizeNonStandardImageSyntax(input: string): string {
  let result = input;
  result = result.replace(/!\[[^\]]*\]\(([^)]+)\)/g, '![]($1)');
  result = result.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, '![$1]($2)');
  result = result.replace(/<img\s+src=["']([^"']+)["'][^>]*>/gi, '![]($1)');
  result = result.replace(/!\[([^\]]*)\]\[\]/g, '![]($1)');
  return result;
}