import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Deletes the signed-in user’s profile data (username, picture, image choices)',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context }) => {
    const [profiles, images] = await Promise.all([
      zite.profiles.findAll({ filters: { user: context.user.id }, limit: 50 }),
      zite.reportImages.findAll({ filters: { chosenBy: context.user.id }, limit: 2000 }),
    ]);
    await Promise.all([
      ...profiles.records.map((r) => zite.profiles.delete({ id: r.id })),
      ...images.records.map((r) => zite.reportImages.delete({ id: r.id })),
      zite.auth.updateUserProfile(context.user.id, { firstName: '', lastName: '', image: null } as any),
    ]);
    return { success: true };
  },
});
