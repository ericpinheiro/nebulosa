import { getUserDataApi } from '@jellyfin/sdk/lib/utils/api';

import { getApi } from './client';

export async function setFavoriteOnServer(userId: string, itemId: string, favorite: boolean): Promise<void> {
  const api = getUserDataApi(getApi());
  if (favorite) await api.markFavoriteItem({ itemId, userId });
  else await api.unmarkFavoriteItem({ itemId, userId });
}
