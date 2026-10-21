import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { reportTabs, readTab } from '../lib/profile';

export default createEndpoint({
  description: 'Lists the top 5 contributors of the past 7 days',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    contributors: z.array(z.object({ name: z.string(), image: z.string().nullable(), count: z.number() })),
  }),
  execute: async () => {
    const tabs = await reportTabs();
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const counts = new Map<string, { name: string; count: number }>();
    await Promise.all(tabs.map(async (t: { title: string }) => {
      const { headers, values } = await readTab(t.title).catch(() => ({ headers: [] as string[], values: [] as string[][] }));
      const lower = headers.map((h) => h.toLowerCase());
      const by = lower.indexOf('uploaded by');
      const date = lower.indexOf('date added');
      if (by < 0 || date < 0) return;
      values.slice(1).forEach((r) => {
        const name = String(r[by] ?? '').trim();
        const ts = Date.parse(String(r[date] ?? ''));
        if (!name || isNaN(ts) || ts < since || ts > Date.now() + 86400000) return;
        const key = name.toLowerCase();
        const cur = counts.get(key) ?? { name, count: 0 };
        cur.count++;
        counts.set(key, cur);
      });
    }));
    const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
    if (!top.length) return { contributors: [] };

    const { records: profiles } = await zite.profiles.findAll({ limit: 2000 });
    const contributors = await Promise.all(top.map(async (c) => {
      const p = profiles.find((x) => x.username?.trim().toLowerCase() === c.name.toLowerCase());
      const userId = p && (Array.isArray(p.user) ? p.user[0] : (p.user as unknown as string));
      let image: string | null = null;
      if (userId) {
        const u = await zite.auth.findAllUsers({ filters: { id: userId }, limit: 1 });
        image = (u.records[0] as any)?.image ?? null;
      }
      return { name: c.name, image, count: c.count };
    }));
    return { contributors };
  },
});
