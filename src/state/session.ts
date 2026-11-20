import { create } from 'zustand';

import * as auth from '@/services/jellyfin/auth';
import type { Session } from '@/services/jellyfin/auth';
import { setAccessToken, setUnauthorizedHandler } from '@/services/jellyfin/client';
import { describeLoginError, LOGIN_MESSAGES } from '@/services/jellyfin/errors';
import { clearSession, readSession, writeSession } from '@/services/storage/secure-session';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: Status;
  session: Session | null;
  error: string | null;
  submitting: boolean;
  restore: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /** Token recusado pelo servidor: apaga tudo e volta ao login. */
  expire: () => Promise<void>;
}

/** Callbacks de limpeza registradas por outras camadas (player, biblioteca) para rodar no logout. */
const signOutListeners = new Set<() => void | Promise<void>>();
export function onSignOut(listener: () => void | Promise<void>): () => void {
  signOutListeners.add(listener);
  return () => signOutListeners.delete(listener);
}

async function runSignOutListeners() {
  for (const l of signOutListeners) {
    try {
      await l();
    } catch {
      // limpeza é best-effort
    }
  }
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'loading',
  session: null,
  error: null,
  submitting: false,

  restore: async () => {
    const session = await readSession().catch(() => null);
    if (session) {
      setAccessToken(session.accessToken);
      set({ status: 'signedIn', session });
    } else {
      set({ status: 'signedOut', session: null });
    }
  },

  signIn: async (username, password) => {
    const user = username.trim();
    if (!user) {
      set({ error: LOGIN_MESSAGES.missingUser });
      return false;
    }
    set({ submitting: true, error: null });
    try {
      const session = await auth.login(user, password);
      await writeSession(session);
      set({ status: 'signedIn', session, submitting: false });
      return true;
    } catch (e) {
      set({ submitting: false, error: describeLoginError(e) });
      return false;
    }
  },

  signOut: async () => {
    await runSignOutListeners();
    await auth.logout();
    await clearSession();
    set({ status: 'signedOut', session: null, error: null });
  },

  expire: async () => {
    if (get().status !== 'signedIn') return;
    await runSignOutListeners();
    setAccessToken(undefined);
    await clearSession();
    set({ status: 'signedOut', session: null, error: null });
  },
}));

setUnauthorizedHandler(() => {
  void useSessionStore.getState().expire();
});

export function currentUserId(): string {
  const id = useSessionStore.getState().session?.userId;
  if (!id) throw new Error('Sem sessão ativa');
  return id;
}
