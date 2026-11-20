import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getColors } from 'react-native-image-colors';

import { imageUrl } from '@/services/player/urls';

const cache = new Map<string, string | null>();

/** Cor dominante da capa (cacheada por item). */
export function useCoverColor(itemId: string | null | undefined, tag?: string | null): string | null {
  const key = itemId ? `${itemId}:${tag ?? ''}` : '';
  const [color, setColor] = useState<string | null>(key ? (cache.get(key) ?? null) : null);

  useEffect(() => {
    if (!key) {
      setColor(null);
      return;
    }
    if (cache.has(key)) {
      setColor(cache.get(key) ?? null);
      return;
    }
    let alive = true;
    const url = imageUrl(itemId, tag, 128);
    if (!url) return;
    getColors(url, { cache: true, key, fallback: '#9a9aa0', quality: 'low' })
      .then((r) => {
        let c: string | null = null;
        if (r.platform === 'ios') c = r.background ?? r.primary;
        else if (r.platform === 'android' || r.platform === 'web') c = r.dominant;
        cache.set(key, c);
        if (alive) setColor(c);
      })
      .catch(() => {
        cache.set(key, null);
        if (alive) setColor(null);
      });
    return () => {
      alive = false;
    };
  }, [key, itemId, tag]);

  return Platform.OS === 'web' ? null : color;
}
