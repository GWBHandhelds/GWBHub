import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { isAdmin } from '../lib/admin';

export default createEndpoint({
  description: 'Returns game cover images, custom icons and whether the user is the admin',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    images: z.record(z.string()),
    icons: z.record(z.string()),
    isAdmin: z.boolean(),
  }),
  execute: async ({ context }) => {
    const [imgs, icons] = await Promise.all([
      zite.reportImages.findAll({ limit: 2000 }),
      zite.customIcons.findAll({ limit: 200 }),
    ]);
    return {
      images: Object.fromEntries(imgs.records.filter((r) => r.gameKey && r.imageUrl).map((r) => [r.gameKey!, r.imageUrl!])),
      icons: Object.fromEntries(icons.records.filter((r) => r.iconKey && r.imageUrl).map((r) => [r.iconKey!, r.imageUrl!])),
      isAdmin: isAdmin(context.user.email),
    };
  },
});