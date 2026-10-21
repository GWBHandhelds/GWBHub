import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';

const API = 'https://www.steamgriddb.com/api/v2';

async function sgdb(path: string) {
  const res = await fetch(API + path, { headers: { Authorization: `Bearer ${process.env.ZITE_STEAMGRIDDB_API_KEY}` } });
  if (!res.ok) throw new ZiteError(`Image search failed (${res.status})`);
  return res.json();
}

export default createEndpoint({
  description: 'Searches SteamGridDB for wide game images by game name',
  authenticated: true,
  inputSchema: z.object({ gameName: z.string() }),
  outputSchema: z.object({ images: z.array(z.object({ url: z.string(), thumb: z.string() })) }),
  execute: async ({ input }) => {
    const term = input.gameName.trim();
    if (!term) return { images: [] };
    const search = await sgdb(`/search/autocomplete/${encodeURIComponent(term)}`);
    const games = (search.data ?? []).slice(0, 2);
    const results = await Promise.all(games.map((g: any) =>
      sgdb(`/grids/game/${g.id}?dimensions=920x430,460x215&types=static`).catch(() => ({ data: [] }))));
    const images = results.flatMap((r: any) => r.data ?? [])
      .map((i: any) => ({ url: String(i.url), thumb: String(i.thumb ?? i.url) }))
      .slice(0, 24);
    return { images };
  },
});
