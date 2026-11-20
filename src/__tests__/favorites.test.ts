const state = { fav: false };

jest.mock('@/state/library/db', () => ({
  getDb: async () => ({ getFirstAsync: async () => ({ is_favorite: state.fav ? 1 : 0 }) }),
}));
jest.mock('@/state/library/repository', () => ({
  setTrackFavorite: jest.fn(async (_id: string, v: boolean) => {
    state.fav = v;
  }),
}));
jest.mock('@/state/library/sync', () => ({
  useLibraryStore: { getState: () => ({ bump: jest.fn() }) },
  refreshUserData: jest.fn(),
}));
jest.mock('@/services/jellyfin/favorites', () => ({ setFavoriteOnServer: jest.fn() }));

import { setFavoriteOnServer } from '@/services/jellyfin/favorites';
import { toggleFavorite } from '@/state/favorites';
import { useSessionStore } from '@/state/session';

describe('toggleFavorite', () => {
  beforeEach(() => {
    state.fav = false;
    useSessionStore.setState({ session: { accessToken: 't', userId: 'u', userName: 'e' }, status: 'signedIn' });
  });

  it('favorita e envia ao servidor', async () => {
    (setFavoriteOnServer as jest.Mock).mockResolvedValueOnce(undefined);
    expect(await toggleFavorite('x')).toBe(true);
    expect(state.fav).toBe(true);
    expect(setFavoriteOnServer).toHaveBeenCalledWith('u', 'x', true);
  });

  it('desfaz se o servidor falhar', async () => {
    (setFavoriteOnServer as jest.Mock).mockRejectedValueOnce(new Error('500'));
    expect(await toggleFavorite('x')).toBe(false);
    expect(state.fav).toBe(false);
  });
});
