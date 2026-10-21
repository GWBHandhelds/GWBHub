import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Saves the signed-in user’s username and profile picture',
  authenticated: true,
  inputSchema: z.object({ username: z.string().optional(), image: z.string().nullable().optional() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.username !== undefined) {
      const username = input.username.trim();
      if (username.length < 2 || username.length > 32) throw new ZiteError('Username must be 2–32 characters.');
      const { rows } = await zite.sql({
        query: `SELECT p."id", p."user" FROM "Profiles" p WHERE lower(trim(p."username")) = lower($1)`,
        params: [username],
      });
      const takenByOther = rows.some((r: any) => {
        const owner = Array.isArray(r.user) ? r.user : [r.user];
        return !owner.includes(context.user.id);
      });
      if (takenByOther) throw new ZiteError('Name is already taken');
      await zite.profiles.bulkCreate({ records: [{ user: context.user.id, username }], matchOn: ['user'] });
    }
    if (input.image !== undefined) {
      await zite.auth.updateUserProfile(context.user.id, { image: input.image ?? undefined });
    }
    return { success: true };
  },
});
