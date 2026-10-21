import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { getUsername } from '../lib/profile';

export default createEndpoint({
  description: 'Gets the signed-in user’s profile (username and picture)',
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({ username: z.string(), image: z.string().nullable() }),
  execute: async ({ context }) => {
    const [username, users] = await Promise.all([
      getUsername(context.user.id),
      zite.auth.findAllUsers({ filters: { id: context.user.id }, limit: 1 }),
    ]);
    return { username, image: (users.records[0] as any)?.image ?? null };
  },
});