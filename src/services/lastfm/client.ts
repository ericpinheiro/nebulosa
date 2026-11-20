import * as Crypto from 'expo-crypto';

import { LASTFM_API_KEY, LASTFM_API_SECRET } from '@/config/server';

import { batchParams, signatureBase, type ScrobbleEntry } from './rules';

const API = 'https://ws.audioscrobbler.com/2.0/';

export const lastfmEnabled = (): boolean => !!LASTFM_API_KEY && !!LASTFM_API_SECRET;

export class LastfmError extends Error {
  constructor(
    message: string,
    readonly code?: number,
  ) {
    super(message);
  }
}

async function call(method: string, params: Record<string, string>, sessionKey?: string): Promise<unknown> {
  const all: Record<string, string> = { ...params, method, api_key: LASTFM_API_KEY };
  if (sessionKey) all.sk = sessionKey;
  all.api_sig = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.MD5, signatureBase(all, LASTFM_API_SECRET));
  all.format = 'json';
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(all).toString(),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: number; message?: string };
  if (!res.ok || json.error) throw new LastfmError(json.message ?? `HTTP ${res.status}`, json.error);
  return json;
}

/** Login com usuário e senha; devolve a chave de sessão (a senha não é guardada). */
export async function getMobileSession(username: string, password: string): Promise<{ name: string; key: string }> {
  const json = (await call('auth.getMobileSession', { username, password })) as {
    session: { name: string; key: string };
  };
  return json.session;
}

export async function updateNowPlaying(sk: string, e: Omit<ScrobbleEntry, 'timestamp'>): Promise<void> {
  const params: Record<string, string> = { artist: e.artist, track: e.track };
  if (e.album) params.album = e.album;
  if (e.duration) params.duration = String(Math.round(e.duration));
  await call('track.updateNowPlaying', params, sk);
}

export async function scrobble(sk: string, entries: ScrobbleEntry[]): Promise<void> {
  if (entries.length === 0) return;
  await call('track.scrobble', batchParams(entries.slice(0, 50)), sk);
}
