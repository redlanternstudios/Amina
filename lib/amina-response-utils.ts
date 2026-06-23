/**
 * Strips internal phase labels, notes, and routing instructions from Amina responses
 * before displaying them to the user.
 */
export function stripPhaseLabels(content: string): string {
  if (!content) return ''

  // Remove lines starting with **Phase or *Phase
  let cleaned = content.replace(/^\*{1,2}Phase\s+\d+:.*$/gm, '')

  // Remove lines with *(Note: ... or (Note: ...
  cleaned = cleaned.replace(/^\s*\*?\(Note:.*\).*$/gm, '')

  // Remove lines containing "Move to Phase" or "stay in Phase"
  cleaned = cleaned.replace(/^.*(?:Move|stay)\s+to\s+Phase\s+\d+.*$/gm, '')

  // Remove excessive blank lines
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n').trim()

  return cleaned
}

/**
 * Renders markdown in content:
 * - **text** becomes <strong>text</strong>
 * - *text* becomes <em>text</em>
 * Handles edge cases like asterisks in URLs or already-rendered HTML.
 */
export function renderMarkdown(content: string): string {
  if (!content) return ''

  let result = content

  // Replace **bold** with <strong>bold</strong>
  result = result.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')

  // Replace *italic* with <em>italic</em> (but not ** which was already handled)
  result = result.replace(/(?<!\*)\*([^\*]+)\*(?!\*)/g, '<em>$1</em>')

  // Preserve line breaks
  result = result.replace(/\n/g, '<br />')

  return result
}

/**
 * Combined utility: strip labels AND render markdown
 */
export function cleanAndRenderAminaResponse(content: string): string {
  const stripped = stripPhaseLabels(content)
  return renderMarkdown(stripped)
}
