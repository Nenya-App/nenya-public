// The totals as a spreadsheet (CSV opens in Excel, Numbers and Google Sheets). Every event in the range is included,
// with zeros, days running oldest to newest left to right, and a total column. Only fixed names and numbers go in.
import { groupTitle, label } from './labels.ts';

export interface ExportStats {
  days: string[];
  events: string[];
  counts: Record<string, Record<string, number>>;
}

const cell = (v: string | number): string => {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function totalsCsv(stats: ExportStats): string {
  const days = [...stats.days].reverse(); // the page lists newest first; a spreadsheet reads oldest first
  const lines = [['Group', 'Event', 'Name', 'Total', ...days].map(cell).join(',')];
  for (const e of stats.events) {
    const per = days.map((d) => stats.counts[d]?.[e] ?? 0);
    const total = per.reduce((a, b) => a + b, 0);
    lines.push([groupTitle(e), e, label(e), total, ...per].map(cell).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

export const csvFilename = (days: string[]): string =>
  days.length ? `nenya-numbers-${days[days.length - 1]}-to-${days[0]}.csv` : 'nenya-numbers.csv';
