import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { sheetsFetch, range, HOME_TAB } from '../lib/sheets';
import { ownerNames } from '../lib/profile';

export default createEndpoint({
  description: 'Adds a compatibility report to a spreadsheet tab and logs it on Home',
  authenticated: true,
  inputSchema: z.object({ tab: z.string(), values: z.record(z.string()) }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.tab === HOME_TAB) throw new ZiteError('Reports can’t be added to Home.');
    const head = await sheetsFetch(`/values/${range(input.tab, 'A1:AZ1')}`);
    const headers: string[] = (head.values?.[0] ?? []).map((h: string) => String(h).trim());
    if (!headers.length) throw new ZiteError('This sheet has no header row.');
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    const name = (await ownerNames(context.user)).display;
    const row = headers.map((h) => {
      const k = h.toLowerCase();
      if (k === 'date added') return today;
      if (k === 'uploaded by') return name;
      return input.values[h] ?? '';
    });
    const res = await sheetsFetch(`/values/${range(input.tab, 'A1')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      body: JSON.stringify({ values: [row] }),
    });
    const m = /!A?(\d+)/.exec(res.updates?.updatedRange ?? '');
    const gameIdx = headers.findIndex((h) => h.toLowerCase() === 'game name');
    if (gameIdx >= 0) {
      await sheetsFetch(`/values/${range(HOME_TAB, 'A1')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        body: JSON.stringify({ values: [[row[gameIdx], input.tab, today, m?.[1] ?? '', 'Latest']] }),
      }).catch(() => undefined);
    }
    return { success: true };
  },
});