const HEADING_BASE =
  "font-extrabold text-[#1a3a4a] leading-tight border-l-4 border-[#2B9EB3] pl-3";

export const MAJOR_HEADING_CLASS = `${HEADING_BASE} text-2xl sm:text-3xl mt-12 mb-4`;

export const SECTION_HEADING_CLASS = `${HEADING_BASE} text-[22px] sm:text-2xl mt-10 mb-3`;

export function extractBoldHeading(line: string): string | null {
  const match = line.trim().match(/^\*\*(.+)\*\*$/);
  if (!match) return null;
  const inner = match[1].trim();
  if (!inner || inner.includes("**")) return null;
  if (inner.length > 100 || inner.endsWith(".")) return null;
  return inner;
}
