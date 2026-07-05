import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // Tanpa baseURL: klien memakai origin halaman saat ini (localhost, IP LAN,
  // atau domain tunnel), sehingga bisa diakses dari perangkat mana pun saat dev.
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
