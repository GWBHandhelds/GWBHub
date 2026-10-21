import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { ownerNames, reportTabs, readTab } from '../lib/profile';

export default createEndpoint({
  description: 'Lists the compatibility reports uploaded by the signed-in user',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    reports: z.array(z.object({
      tab: z.string(), rowNumber: z.number(), gameName: z.string(), status: z.string(), device: z.string(), dateAdded: z.string(),
      headers: z.array(z.string()), values: z.array(z.string()),
    })),
  }),
  execute: async ({ context }) => {
    const names = await ownerNames(context.user);
    const tabs = await reportTabs();
    const all = await Promise.all(tabs.map(async ({ title }: { title: string }) => {
      const { headers, values } = await readTab(title);
      const idx = (n: string) => headers.findIndex((h) => h.toLowerCase() === n);
      const up = idx('uploaded by');
      if (up < 0) return [];
      return values.slice(1).flatMap((r, i) => {
        if (!names.all.includes(String(r[up] ?? '').trim().toLowerCase())) return [];
        const v = headers.map((_, c) => String(r[c] ?? '').trim());
        const get = (n: string) => (idx(n) >= 0 ? v[idx(n)] : '');
        return [{ tab: title, rowNumber: i + 2, gameName: get('game name'), status: get('status'), device: get('device'), dateAdded: get('date added'), headers, values: v }];
      });
    }));
    return { reports: all.flat() };
  },
});
