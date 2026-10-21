import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { sheetsFetch, range, HOME_TAB } from '../lib/sheets';

const FILTER_RE = /Filter$/;

export default createEndpoint({
  description: 'Reads the headers, rows and dropdown options of one spreadsheet tab',
  authenticated: true,
  inputSchema: z.object({ tab: z.string() }),
  outputSchema: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.object({
      rowNumber: z.number(),
      values: z.array(z.string()),
      detail: z.object({ headers: z.array(z.string()), values: z.array(z.string()) }).optional(),
    })),
    options: z.record(z.array(z.string())),
    suggestions: z.record(z.array(z.string())),
    filterColumns: z.array(z.string()),
  }),
  execute: async ({ input }) => {
    const [data, meta] = await Promise.all([
      sheetsFetch(`/values/${range(input.tab, 'A1:AZ')}`),
      sheetsFetch(`?ranges=${range(input.tab, 'A2:AZ300')}&fields=sheets.data.rowData.values.dataValidation`),
    ]);
    const values: string[][] = data.values ?? [];
    const headers = (values[0] ?? []).map((h) => String(h).trim());

    // Awesome Table-style config row (e.g. "StringFilter", "CategoryFilter") under the headers
    const second = values[1] ?? [];
    const hasFilterRow = second.some((v) => FILTER_RE.test(String(v).trim()));
    const filterColumns = new Set<string>();
    if (hasFilterRow) second.forEach((v, i) => { if (/CategoryFilter/.test(String(v)) && headers[i]) filterColumns.add(headers[i]); });

    const rows = values
      .slice(hasFilterRow ? 2 : 1)
      .map((r, i) => ({
        rowNumber: i + (hasFilterRow ? 3 : 2),
        values: headers.map((_, c) => String(r[c] ?? '').trim()),
        detail: undefined as { headers: string[]; values: string[] } | undefined,
      }))
      .filter((r) => r.values.some((v) => v));

    const options: Record<string, string[]> = {};
    const rangeLookups: Array<[string, string]> = [];
    for (const row of meta.sheets?.[0]?.data?.[0]?.rowData ?? []) {
      (row.values ?? []).forEach((cell: any, i: number) => {
        const h = headers[i];
        const cond = cell?.dataValidation?.condition;
        if (!h || !cond || options[h] || rangeLookups.some(([x]) => x === h)) return;
        if (cond.type === 'ONE_OF_LIST') options[h] = (cond.values ?? []).map((v: any) => String(v.userEnteredValue));
        if (cond.type === 'ONE_OF_RANGE') rangeLookups.push([h, String(cond.values?.[0]?.userEnteredValue ?? '').replace(/^=/, '')]);
      });
    }
    await Promise.all(rangeLookups.map(async ([h, ref]) => {
      if (!ref) return;
      const res = await sheetsFetch(`/values/${encodeURIComponent(ref)}`).catch(() => null);
      options[h] = [...new Set<string>((res?.values ?? []).flat().map((v: any) => String(v).trim()).filter(Boolean))];
    }));
    Object.keys(options).forEach((h) => filterColumns.add(h));

    // Home: swap "Row Number" for who uploaded the report in its source tab
    const rnIdx = headers.findIndex((h) => h.toLowerCase() === 'row number');
    const srcIdx = headers.findIndex((h) => h.toLowerCase() === 'source');
    if (input.tab === HOME_TAB && rnIdx >= 0 && srcIdx >= 0) {
      const src = (s: string) => s;
const sources = [...new Set(rows.map((r) => src(r.values[srcIdx])).filter(Boolean))];
      const byTab: Record<string, string[][]> = {};
      await Promise.all(sources.map(async (s) => {
        const res = await sheetsFetch(`/values/${range(s, 'A1:AZ')}`).catch(() => null);
        byTab[s] = res?.values ?? [];
      }));
      rows.forEach((r) => {
        const sheet = byTab[src(r.values[srcIdx])] ?? [];
        const head = (sheet[0] ?? []).map((h) => String(h).trim().toLowerCase());
        const col = head.indexOf('uploaded by');
        const gameCol = head.indexOf('game name');
        const gameIdx = headers.findIndex((h) => h.toLowerCase() === 'game name');
        const name = gameIdx >= 0 ? r.values[gameIdx].toLowerCase() : '';
        // Match by game name (row numbers on Home can drift), falling back to the row number
        let match = gameCol >= 0 && name ? sheet.find((row, i) => i > 0 && String(row[gameCol] ?? '').trim().toLowerCase() === name) : undefined;
        if (!match) { const n = parseInt(r.values[rnIdx], 10); match = n > 0 ? sheet[n - 1] : undefined; }
        r.values[rnIdx] = col >= 0 && match ? String(match[col] ?? '').trim() : '';
        if (match) {
          const srcHeaders = (sheet[0] ?? []).map((h) => String(h).trim());
          const keep = srcHeaders.map((h, i) => i).filter((i) => srcHeaders[i] && srcHeaders[i].toLowerCase() !== 'row number');
          r.detail = { headers: keep.map((i) => srcHeaders[i]), values: keep.map((i) => String(match![i] ?? '').trim()) };
        }
      });
      headers[rnIdx] = 'Uploaded By';
    }

    const suggestions: Record<string, string[]> = {};
    headers.forEach((h, c) => {
      if (!h || options[h] || /link|info|date added|uploaded by/i.test(h)) return;
      const uniq = [...new Set(rows.map((r) => r.values[c]).filter(Boolean))];
      if (uniq.length && uniq.length <= 60) suggestions[h] = uniq.sort();
    });

    // Hide any "Row Number" column everywhere
    const hideIdx = headers.findIndex((h) => h.toLowerCase() === 'row number');
    if (hideIdx >= 0) {
      headers.splice(hideIdx, 1);
      rows.forEach((r) => r.values.splice(hideIdx, 1));
    }

    return { headers, rows, options, suggestions, filterColumns: headers.filter((h) => filterColumns.has(h)) };
  },
});
