export function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h])).join(','))
  ].join('\n');
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
