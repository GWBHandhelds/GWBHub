import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { sheetsFetch, range, HOME_TAB } from '../lib/sheets';
import { ownerNames, readTab } from '../lib/profile';
 
const AUTO = ['date added', 'uploaded by', 'row number'];
 
export default createEndpoint({
  description: 'Edits one of the signed-in user’s own reports in the sheet',
  authenticated: true,
  inputSchema: z.object({ tab: z.string(), rowNumber: z.number().int().min(2), gameName: z.string(), values: z.record(z.string()) }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.tab === HOME_TAB) throw new ZiteError('Home entries can’t be edited.');
    const { headers, values } = await readTab(input.tab);
    const up = headers.findIndex((h) => h.toLowerCase() === 'uploaded by');
    const gn = headers.findIndex((h) => h.toLowerCase() === 'game name');
    const row = values[input.rowNumber - 1];
    const names = await ownerNames(context.user);
    if (!row || up < 0 || !names.all.includes(String(row[up] ?? '').trim().toLowerCase()) ||
      (gn >= 0 && String(row[gn] ?? '').trim() !== input.gameName)) {
      throw new ZiteError('This report changed or isn’t yours — refresh and try again.');
    }
    // Keep auto-filled columns as they were; replace everything else with the edited values
    const next = headers.map((h, i) => AUTO.includes(h.toLowerCase()) || !h ? String(row[i] ?? '') : (input.values[h] ?? ''));
    if (gn >= 0 && !next[gn].trim()) throw new ZiteError('Game Name is required.');
    await sheetsFetch(`/values/${range(input.tab, `A${input.rowNumber}`)}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      body: JSON.stringify({ values: [next] }),
    });
    return { success: true };
  },
});
