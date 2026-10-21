import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { sheetsFetch } from '../lib/sheets';
import { ownerNames, reportTabs, readTab } from '../lib/profile';

export default createEndpoint({
  description: 'Deletes one of the signed-in user’s own reports from the sheet',
  authenticated: true,
  inputSchema: z.object({ tab: z.string(), rowNumber: z.number().int().min(2), gameName: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    const tab = (await reportTabs()).find((t: { title: string }) => t.title === input.tab);
    if (!tab) throw new ZiteError('That sheet was not found.');
    const { headers, values } = await readTab(input.tab);
    const up = headers.findIndex((h) => h.toLowerCase() === 'uploaded by');
    const gn = headers.findIndex((h) => h.toLowerCase() === 'game name');
    const row = values[input.rowNumber - 1];
    const names = await ownerNames(context.user);
    // Re-check ownership and that the row hasn't shifted since it was listed
    if (!row || up < 0 || !names.all.includes(String(row[up] ?? '').trim().toLowerCase()) ||
      (gn >= 0 && String(row[gn] ?? '').trim() !== input.gameName)) {
      throw new ZiteError('This report changed or isn’t yours — refresh and try again.');
    }
    await sheetsFetch(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId: tab.sheetId, dimension: 'ROWS', startIndex: input.rowNumber - 1, endIndex: input.rowNumber } } }] }),
    });
    return { success: true };
  },
});