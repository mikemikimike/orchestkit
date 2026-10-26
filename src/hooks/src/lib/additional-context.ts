/** Claude Code silently truncates UserPromptSubmit additionalContext at these limits. */
export const MAX_ADDITIONAL_CONTEXT_CHARS = 8_000;
export const MAX_ADDITIONAL_CONTEXT_LINES = 200;

export function countAdditionalContextLineBreaks(context: string): number {
  return (context.match(/\r\n|\r|\n/g) ?? []).length;
}

export function limitAdditionalContext(
  context: string,
  maxChars = MAX_ADDITIONAL_CONTEXT_CHARS,
  maxLines = MAX_ADDITIONAL_CONTEXT_LINES,
): string {
  let end = Math.min(context.length, Math.max(0, Math.floor(maxChars)));
  const lineLimit = Math.max(0, Math.floor(maxLines));
  if (end === 0 || lineLimit === 0) return '';

  if (end < context.length && end > 0) {
    const last = context.charCodeAt(end - 1);
    const next = context.charCodeAt(end);
    if (last >= 0xd800 && last <= 0xdbff && next >= 0xdc00 && next <= 0xdfff) end--;
    if (context[end - 1] === '\r' && context[end] === '\n') end--;
  }

  let lines = 1;
  for (let index = 0; index < end; index++) {
    const char = context[index];
    if (char !== '\r' && char !== '\n') continue;
    if (lines === lineLimit) return context.slice(0, index);
    lines++;
    if (char === '\r' && context[index + 1] === '\n') index++;
  }

  return context.slice(0, end);
}
