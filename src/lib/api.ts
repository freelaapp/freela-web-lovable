import { refreshAuthToken, logout } from "@/lib/auth";

const API_BASE_URL = "https://api.freelaservicos.com.br";

// Trocar para "mobile" quando necessário
const ORIGIN_TYPE = "Web";

// ── Session expired callback ────────────────────────────────────
// Registered by AuthContext so the API layer can trigger logout
// without importing React context (avoids circular deps).
type OnSessionExpired = () => void;
let onSessionExpiredCallback: OnSessionExpired | null = null;

export function registerSessionExpiredHandler(cb: OnSessionExpired): void {
  onSessionExpiredCallback = cb;
}

// ── Sentinel error ──────────────────────────────────────────────
// Thrown when a 401 is detected after a failed refresh attempt.
// Callers can catch it explicitly if they need custom handling,
// but in most cases the global handler already redirected to login.
export class SessionExpiredError extends Error {
  constructor() {
    super("Sessão expirada. Faça login novamente.");
    this.name = "SessionExpiredError";
  }
}

// ── Authenticated fetch with automatic token refresh ────────────
/**
 * Drop-in replacement for fetch() for authenticated endpoints.
 *
 * Flow:
 * 1. Attach the stored Bearer token.
 * 2. Execute the request.
 * 3. If the response is 401 → attempt one silent token refresh.
 * 4. If refresh succeeds → retry the original request once with the new token.
 * 5. If refresh fails (API returned 401/any error) → clear local auth,
 *    fire the registered session-expired handler and throw SessionExpiredError.
 */
export async function apiFetch(
  input: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<Response> {
  const { skipAuth = false, ...fetchInit } = init;

  const buildHeaders = (extraHeaders?: HeadersInit): HeadersInit => {
    const base: Record<string, string> = {
      "Origin-type": ORIGIN_TYPE,
      ...(fetchInit.headers as Record<string, string>),
      ...(extraHeaders as Record<string, string>),
    };

    if (!skipAuth) {
      const raw = localStorage.getItem("authToken");
      if (raw) {
        try {
          const token = JSON.parse(raw) as string;
          base["Authorization"] = `Bearer ${token}`;
        } catch {
          // malformed token — will 401 and trigger refresh below
        }
      }
    }

    // When the body is FormData the browser must set Content-Type itself
    // (it needs to include the multipart boundary). Removing it here
    // ensures the header is never overridden by accident.
    if (fetchInit.body instanceof FormData) {
      delete base["Content-Type"];
    }

    return base;
  };

  const response = await fetch(input, {
    credentials: "include",
    ...fetchInit,
    headers: buildHeaders(),
  });

  // Not a 401 or auth is skipped — return as-is
  if (response.status !== 401 || skipAuth) return response;

  // ── 401 received — attempt silent refresh ──────────────────────
  const refreshed = await refreshAuthToken();

  if (!refreshed) {
    logout();
    onSessionExpiredCallback?.();
    throw new SessionExpiredError();
  }

  // Refresh succeeded — retry original request with new token
  return fetch(input, {
    credentials: "include",
    ...fetchInit,
    headers: buildHeaders(),
  });
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: string; // accessToken
  status: number;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiFetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    skipAuth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...payload, date: new Date().toISOString() }),
  });

  const body = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Credenciais incorretas.");
  }

  if (response.status === 429) {
    throw new Error("Muitas tentativas. Tente novamente mais tarde.");
  }

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível entrar. Verifique seus dados e tente novamente.");
  }

  if (!body?.success || !body?.data || typeof body.data !== "string") {
    throw new Error(body?.message || "Não foi possível entrar. Verifique seus dados e tente novamente.");
  }

  return body as LoginResponse;
}

interface RegisterPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: string;
  createdAt: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: string; // accessToken
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await apiFetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    skipAuth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (response.status === 409) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível criar sua conta. Tente novamente.");
  }

  if (!body?.success || !body?.data || typeof body.data !== "string") {
    throw new Error(body?.message || "Resposta inesperada do servidor.");
  }

  console.log("[register] status:", response.status, "message:", body.message);

  return body as RegisterResponse;
}

export async function generateEmailConfirmationCode(email: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/users/generate-email-confirmation-code?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      skipAuth: true,
    },
  );

  if (response.status !== 200) {
    throw new Error("Não foi possível enviar o código de confirmação. Verifique o e-mail e tente novamente.");
  }
}

export async function confirmEmail(email: string, code: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/users/confirm-email`, {
    method: "POST",
    skipAuth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, email, createdAt: new Date().toISOString() }),
  });

  if (response.status !== 200) {
    throw new Error("Código inválido ou expirado. Tente novamente.");
  }
}

export async function registerProvider(formData: FormData): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/providers/`, {
    method: "POST",
    body: formData,
  });

  if (response.status !== 200 && response.status !== 201) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Não foi possível completar o cadastro. Tente novamente.");
  }
}

// ── Contractor Profile ─────────────────────────────────────────
export interface ContractorProfile {
  id: string;
  establishmentName?: string;
  fantasyName?: string;
  companyName?: string;
  name?: string;
  [key: string]: unknown;
}

export async function getContractorProfile(token: string): Promise<ContractorProfile> {
  const response = await apiFetch(`${API_BASE_URL}/users/contractors`, {
    method: "GET",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível carregar o perfil do contratante.");
  }

  const data = body?.data ?? body;
  return data as ContractorProfile;
}

// ── Create Vacancy ─────────────────────────────────────────────
export interface FreelancerEntry {
  quantity: number;
  assignment: string;
  jobTime: string;
  jobValue: string;
}

export interface CreateVacancyPayload {
  establishment: string;
  description: string;
  jobDate: string;
  status: string;
  contractorId: string;
  createdAt: string;
  freelancers: FreelancerEntry[];
}

// ── Candidacy ──────────────────────────────────────────────────

export interface CandidacyActionResponse {
  id: string;
  status: "accepted" | "rejected";
  date: string;
  providerId: string;
  jobId?: string;
  vacancy: {
    id: string;
    status: string;
    contractorId?: string;
    [key: string]: unknown;
  };
}

export async function acceptCandidacy(candidacyId: string): Promise<CandidacyActionResponse> {
  const response = await apiFetch(`${API_BASE_URL}/candidacies/${candidacyId}/accept`, {
    method: "PATCH",
  });

  const body = await response.json().catch(() => null);

  if (response.status === 403) {
    throw new Error("Esta vaga já atingiu o número máximo de freelancers.");
  }
  if (response.status === 409) {
    throw new Error("Esta candidatura já foi aceita ou recusada anteriormente.");
  }
  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível aceitar a candidatura. Tente novamente.");
  }

  return body.data as CandidacyActionResponse;
}

export async function rejectCandidacy(candidacyId: string): Promise<CandidacyActionResponse> {
  const response = await apiFetch(`${API_BASE_URL}/candidacies/${candidacyId}/reject`, {
    method: "PATCH",
  });

  const body = await response.json().catch(() => null);

  if (response.status === 404) {
    throw new Error("Candidatura não encontrada.");
  }
  if (response.status === 409) {
    throw new Error("Esta candidatura já foi aceita ou recusada anteriormente.");
  }
  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível recusar a candidatura. Tente novamente.");
  }

  return body.data as CandidacyActionResponse;
}

export async function createVacancy(payload: CreateVacancyPayload, token: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/vacancies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível criar a vaga. Tente novamente.");
  }
}
