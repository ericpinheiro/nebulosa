import { useQuery } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { setFavoriteOnServer } from '@/services/jellyfin/favorites';

import { getDb } from './library/db';
import { setTrackFavorite } from './library/repository';
import { refreshUserData, useLibraryStore } from './library/sync';
import { useSessionStore } from './session';

async function isFavorite(id: string): Promise<boolean> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ is_favorite: number }>('SELECT is_favorite FROM tracks WHERE id = ?', id);
  return r?.is_favorite === 1;
}

/**
 * Favorita/desfavorita com atualização otimista: grava local, avisa a UI,
 * envia ao Jellyfin e desfaz se o servidor falhar. Retorna o estado final.
 */
export async function toggleFavorite(id: string): Promise<boolean> {
  const userId = useSessionStore.getState().session?.userId;
  if (!userId) return false;
  const before = await isFavorite(id);
  const after = !before;
  const bump = useLibraryStore.getState().bump;
  await setTrackFavorite(id, after);
  bump();
  try {
    await setFavoriteOnServer(userId, id, after);
    return after;
  } catch {
    await setTrackFavorite(id, before);
    bump();
    return before;
  }
}

export function useIsFavorite(id: string | null | undefined): boolean {
  const v = useLibraryStore((s) => s.version);
  return (
    useQuery({ queryKey: ['isFavorite', id, v], queryFn: () => isFavorite(id!), enabled: !!id, staleTime: Infinity })
      .data ?? false
  );
}

let lastRefresh = 0;

/** Reaplica favoritos e últimas reproduções do servidor ao voltar para o primeiro plano. */
export function startForegroundRefresh(): () => void {
  const sub = AppState.addEventListener('change', (state) => {
    if (state !== 'active') return;
    const userId = useSessionStore.getState().session?.userId;
    if (!userId || Date.now() - lastRefresh < 60_000) return;
    lastRefresh = Date.now();
    void refreshUserData(userId).catch(() => undefined);
  });
  return () => sub.remove();
}
