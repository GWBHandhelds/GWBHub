import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { ownerNames, readTab } from '../lib/profile';
import { isAdmin, gameKey } from '../lib/admin';

export default createEndpoint({
  description: 'Sets the cover image for a game the signed-in user reported',
  authenticated: true,
  inputSchema: z.object({ tab: z.string(), gameName: z.string(), imageUrl: z.string().url() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (!isAdmin(context.user.email)) {
      const names = await ownerNames(context.user);
      const { headers, values } = await readTab(input.tab);
      const lower = headers.map((h) => h.toLowerCase());
      const up = lower.indexOf('uploaded by');
      const gn = lower.indexOf('game name');
      const owns = up >= 0 && gn >= 0 && values.slice(1).some((r) =>
        gameKey(String(r[gn] ?? '')) === gameKey(input.gameName) && names.all.includes(String(r[up] ?? '').trim().toLowerCase()));
      if (!owns) throw new ZiteError('Only the person who uploaded this report can change its image.');
    }
    await zite.reportImages.bulkCreate({
      records: [{ gameKey: gameKey(input.gameName), tab: input.tab, gameName: input.gameName.trim(), imageUrl: input.imageUrl, chosenBy: context.user.id }],
      matchOn: ['gameKey'],
    });
    return { success: true };
  },
});
