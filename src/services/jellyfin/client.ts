import { Jellyfin, type Api } from '@jellyfin/sdk';
import axios, { isAxiosError } from 'axios';

import { CLIENT_NAME, SERVER_URL } from '@/config/server';

import { getAppVersion, getDeviceId, getDeviceName } from './device';

let jellyfin: Jellyfin | null = null;
let api: Api | null = null;
let unauthorizedHandler: (() => void) | null = null;

function sdk(): Jellyfin {
  if (!jellyfin) {
    jellyfin = new Jellyfin({
      clientInfo: { name: CLIENT_NAME, version: getAppVersion() },
      deviceInfo: { name: getDeviceName(), id: getDeviceId() },
    });
  }
  return jellyfin;
}

function createAxios() {
  const instance = axios.create({ timeout: 20_000 });
  instance.interceptors.response.use(undefined, (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401 && api?.accessToken) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  });
  return instance;
}

/** Api do Jellyfin com o servidor fixo. Sem token até o login. */
export function getApi(): Api {
  if (!api) api = sdk().createApi(SERVER_URL, undefined, createAxios());
  return api;
}

export function setAccessToken(token: string | undefined): void {
  getApi().update({ accessToken: token ?? '' });
}

/** Registrado pela camada de estado: chamado quando o servidor recusa o token (401). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/** Cabeçalho de autorização para requisições feitas fora do SDK (ex.: player nativo). */
export function authorizationHeader(): string {
  return getApi().authorizationHeader;
}

export function accessToken(): string {
  return getApi().accessToken;
}
