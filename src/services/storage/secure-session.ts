import * as SecureStore from 'expo-secure-store';

import type { Session } from '../jellyfin/auth';

const SESSION_KEY = 'nebulosa.session';

/** Sessão (token, id e nome do usuário) no Keychain/Keystore. A senha nunca é guardada. */
export async function readSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.accessToken || !parsed.userId) return null;
    return {
      accessToken: parsed.accessToken,
      userId: parsed.userId,
      userName: parsed.userName ?? '',
      serverId: parsed.serverId,
    };
  } catch {
    return null;
  }
}

export async function writeSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
