import { getAuthenticationApi, getSessionApi } from '@jellyfin/sdk/lib/utils/api';

import { getApi, setAccessToken } from './client';

export interface Session {
  accessToken: string;
  userId: string;
  userName: string;
  serverId?: string;
}

export async function login(username: string, password: string): Promise<Session> {
  const { data } = await getAuthenticationApi(getApi()).authenticateUserByName({
    authenticateUserByName: { Username: username, Pw: password },
  });
  if (!data.AccessToken || !data.User?.Id) {
    throw new Error('Resposta de login sem token');
  }
  const session: Session = {
    accessToken: data.AccessToken,
    userId: data.User.Id,
    userName: data.User.Name ?? username,
    serverId: data.ServerId ?? undefined,
  };
  setAccessToken(session.accessToken);
  return session;
}

/** Avisa o servidor que a sessão terminou. Falhas são ignoradas: o logout local acontece de qualquer jeito. */
export async function logout(): Promise<void> {
  try {
    await getSessionApi(getApi()).reportSessionEnded();
  } catch {
    // ignorado de propósito
  } finally {
    setAccessToken(undefined);
  }
}
