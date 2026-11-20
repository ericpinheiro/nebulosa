import { AxiosError, AxiosHeaders } from 'axios';
import * as SecureStore from 'expo-secure-store';

import * as auth from '@/services/jellyfin/auth';
import { getDeviceId } from '@/services/jellyfin/device';
import { describeLoginError, LOGIN_MESSAGES } from '@/services/jellyfin/errors';
import { useSessionStore } from '@/state/session';

function axiosError(status?: number) {
  const err = new AxiosError('fail');
  if (status) {
    err.response = {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: null,
    };
  }
  return err;
}

describe('describeLoginError', () => {
  it('401 vira credenciais incorretas', () => {
    expect(describeLoginError(axiosError(401))).toBe(LOGIN_MESSAGES.invalidCredentials);
  });
  it('erro de rede ou 5xx vira servidor indisponível', () => {
    expect(describeLoginError(axiosError())).toBe(LOGIN_MESSAGES.unreachable);
    expect(describeLoginError(axiosError(502))).toBe(LOGIN_MESSAGES.unreachable);
  });
});

describe('device id', () => {
  it('é estável entre chamadas', () => {
    expect(getDeviceId()).toBe(getDeviceId());
  });
});

describe('session store', () => {
  beforeEach(() => {
    useSessionStore.setState({ status: 'signedOut', session: null, error: null, submitting: false });
    jest.restoreAllMocks();
  });

  it('não chama o servidor com usuário vazio', async () => {
    const spy = jest.spyOn(auth, 'login');
    const ok = await useSessionStore.getState().signIn('  ', 'x');
    expect(ok).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    expect(useSessionStore.getState().error).toBe(LOGIN_MESSAGES.missingUser);
  });

  it('guarda token mas não a senha', async () => {
    jest.spyOn(auth, 'login').mockResolvedValue({ accessToken: 'tok', userId: 'u1', userName: 'eric' });
    const ok = await useSessionStore.getState().signIn('eric', 'segredo');
    expect(ok).toBe(true);
    expect(useSessionStore.getState().status).toBe('signedIn');
    const saved = (SecureStore as unknown as { __store: Map<string, string> }).__store;
    const all = [...saved.values()].join('');
    expect(all).toContain('tok');
    expect(all).not.toContain('segredo');
  });

  it('restaura a sessão salva e expira com 401', async () => {
    await useSessionStore.getState().restore();
    expect(useSessionStore.getState().status).toBe('signedIn');
    await useSessionStore.getState().expire();
    expect(useSessionStore.getState().status).toBe('signedOut');
    await useSessionStore.getState().restore();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('mostra erro de credenciais', async () => {
    jest.spyOn(auth, 'login').mockRejectedValue(axiosError(401));
    await useSessionStore.getState().signIn('eric', 'errada');
    expect(useSessionStore.getState().error).toBe(LOGIN_MESSAGES.invalidCredentials);
    expect(useSessionStore.getState().status).toBe('signedOut');
  });
});
