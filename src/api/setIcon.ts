import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { isAdmin } from '../lib/admin';

export default createEndpoint({
  description: 'Admin: sets or resets a custom icon for a menu tab or the logo',
  authenticated: true,
  inputSchema: z.object({ iconKey: z.string(), imageUrl: z.string().nullable() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (!isAdmin(context.user.email)) throw new ZiteError('Only the admin can change icons.');
    if (input.imageUrl) {
      await zite.customIcons.bulkCreate({ records: [{ iconKey: input.iconKey, imageUrl: input.imageUrl }], matchOn: ['iconKey'] });
    } else {
      const { records } = await zite.customIcons.findAll({ filters: { iconKey: input.iconKey }, limit: 10 });
      await Promise.all(records.map((r) => zite.customIcons.delete({ id: r.id })));
    }
    return { success: true };
  },
});
