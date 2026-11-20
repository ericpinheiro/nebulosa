import { isAxiosError } from 'axios';

export const LOGIN_MESSAGES = {
  invalidCredentials: 'Usuário ou senha incorretos',
  unreachable: 'Não foi possível falar com o servidor',
  missingUser: 'Informe o usuário',
  unknown: 'Algo deu errado. Tente de novo.',
} as const;

/** Traduz um erro do login para a mensagem exibida ao usuário. */
export function describeLoginError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) return LOGIN_MESSAGES.invalidCredentials;
    if (status == null || status >= 500) return LOGIN_MESSAGES.unreachable;
    return LOGIN_MESSAGES.unknown;
  }
  return LOGIN_MESSAGES.unknown;
}
