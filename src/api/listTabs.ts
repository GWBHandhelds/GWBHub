import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { sheetsFetch } from '../lib/sheets';

export default createEndpoint({
  description: 'Lists the tabs in the compatibility spreadsheet',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ tabs: z.array(z.string()) }),
  execute: async () => {
    const data = await sheetsFetch('?fields=sheets.properties.title');
    return { tabs: (data.sheets ?? []).map((s: any) => s.properties.title as string) };
  },
});
