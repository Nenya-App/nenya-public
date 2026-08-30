// Shared plain-text sanitizer. Strips anything that isn't plain text:
// HTML/XML tags (so no markup or script content can ride along), and
// non-printable control characters (keeping newline, tab, and carriage
// return). Used everywhere free-form user text needs to stay plain --
// voluntary report submissions (reportSubmission.ts) and any gateway
// free-text field that flows into the generated report/PDF.
export function sanitizePlainText(input: string, maxLength: number): string {
  const withoutTags = input.replace(/<[^>]*>/g, '');

  // Filtering control characters by char code rather than a regex literal:
  // control-character ranges are easy to mangle in transit and hard to
  // eyeball-verify once written, so this is the unambiguous version.
  let printableOnly = '';
  for (let i = 0; i < withoutTags.length; i++) {
    const code = withoutTags.charCodeAt(i);
    const isKeptWhitespace = code === 9 || code === 10 || code === 13; // tab, \n, \r
    const isControl = (code < 32 && !isKeptWhitespace) || code === 127;
    if (!isControl) {
      printableOnly += withoutTags[i];
    }
  }

  return printableOnly.trim().slice(0, maxLength);
}
