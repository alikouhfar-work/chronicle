const MENTION_PATTERN = /(?<![\w@])@([a-z0-9_]{3,32})(?![a-z0-9_])/gi;

const stripFencedCode = (content: string): string => {
  const lines = content.split(/\r?\n/);
  const visibleLines: string[] = [];
  let fence: { character: '`' | '~'; length: number } | null = null;

  for (const line of lines) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = { character: marker[1][0] as '`' | '~', length: marker[1].length };
      continue;
    }

    if (fence) {
      const closing = line.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (
        closing &&
        closing[1][0] === fence.character &&
        closing[1].length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    visibleLines.push(line);
  }

  return visibleLines.join('\n');
};

/** Extract unique, lowercase @handles from prose, excluding Markdown code. */
export const extractMentionHandles = (content: string): string[] => {
  const prose = stripFencedCode(content).replace(/(`+)[\s\S]*?\1/g, ' ');
  const handles = new Set<string>();

  for (const match of prose.matchAll(MENTION_PATTERN)) {
    handles.add(match[1].toLowerCase());
  }

  return [...handles];
};
