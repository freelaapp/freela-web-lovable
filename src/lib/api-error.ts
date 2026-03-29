import { SessionExpiredError } from "./api";

export interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * Extrai a mensagem de erro exata da API.
 * Se for erro de rede (TypeError), retorna mensagem de conexão.
 * Se for SessionExpiredError, relança.
 * Caso contrário, retorna a mensagem do body.message ou do Error.
 */
export function extractApiError(err: unknown, fallback?: string): string {
  if (err instanceof SessionExpiredError) throw err;

  if (err instanceof TypeError) {
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  }

  if (err instanceof Error) {
    return err.message || fallback || "Erro inesperado.";
  }

  return fallback || "Erro inesperado.";
}

/**
 * Lê o body JSON de uma Response e lança Error com a mensagem exata da API.
 * Use após fetch/apiFetch quando !response.ok.
 */
export async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);
  const message = body?.message || `Erro ${response.status}`;
  throw new Error(message);
}
