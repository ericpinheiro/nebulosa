import { SERVER_URL } from '@/config/server';

import { accessToken } from '../jellyfin/client';
import { getDeviceId } from '../jellyfin/device';

const DIRECT_CONTAINERS = 'flac,mp3,m4a,aac,alac,ogg,opus,wav,webma,webm';

/** URL do endpoint universal: direct play (FLAC original) quando o formato é aceito. */
export function streamUrl(itemId: string, userId: string): string {
  const params = new URLSearchParams({
    UserId: userId,
    DeviceId: getDeviceId(),
    Container: DIRECT_CONTAINERS,
    MaxStreamingBitrate: '140000000',
    TranscodingContainer: 'mp4',
    TranscodingProtocol: 'http',
    AudioCodec: 'aac',
    EnableRedirection: 'true',
    EnableRemoteMedia: 'false',
    ApiKey: accessToken(),
  });
  return `${SERVER_URL}/Audio/${encodeURIComponent(itemId)}/universal?${params.toString()}`;
}

/** URL da capa (Primary) com largura máxima; `tag` ajuda o cache. */
export function imageUrl(itemId: string | null | undefined, tag?: string | null, maxWidth = 512): string | undefined {
  if (!itemId) return undefined;
  const params = new URLSearchParams({ maxWidth: String(maxWidth), quality: '90' });
  if (tag) params.set('tag', tag);
  return `${SERVER_URL}/Items/${encodeURIComponent(itemId)}/Images/Primary?${params.toString()}`;
}
