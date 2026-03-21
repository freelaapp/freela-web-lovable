import { refreshAuthToken, logout } from "@/lib/auth";

const API_BASE_URL = import.meta.env.API_BASE_URL;

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
  console.log("[getContractorProfile] response bruto:", JSON.stringify(body));

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível carregar o perfil do contratante.");
  }

  // body.data pode ser objeto direto ou array com um item
  const raw = body?.data ?? body;
  const data = Array.isArray(raw) ? raw[0] : raw;
  console.log("[getContractorProfile] data resolvido:", JSON.stringify(data));
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
  contractorId: string;
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

// ── Provider Details (public) ──────────────────────────────────
export interface ProviderDetails {
  id: string;
  pixKeyValue?: string;
  pixKeyType?: string;
  [key: string]: unknown;
}

export async function getProviderDetails(providerId: string): Promise<ProviderDetails> {
  const response = await apiFetch(`${API_BASE_URL}/providers/${providerId}`, {
    method: "GET",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível carregar os dados do freelancer.");
  }

  const data = body?.data ?? body;
  return data as ProviderDetails;
}

// ── Job Payment ───────────────────────────────────────────────
export interface CreateJobPaymentPayload {
  vacancyId: string;
  contractorId: string;
  providerId: string;
  providerPixKeyId: string;
  method: string;
}

export interface JobPaymentResponse {
  id?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  pixCopyPaste?: string;
  brCode?: string;
  pixQrCode?: string;
  pixQrCodeImage?: string;
  value?: number;
  status?: string;
  [key: string]: unknown;
}

export async function createJobPayment(jobId: string, payload: CreateJobPaymentPayload): Promise<JobPaymentResponse> {
  const response = await apiFetch(`${API_BASE_URL}/jobs/${jobId}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível criar o pagamento. Tente novamente.");
  }

  return (body?.data ?? body) as JobPaymentResponse;
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

// ── Contractor by ID (public profile) ─────────────────────────
export interface PublicContractorProfile {
  id: string;
  cnpj: string | null;
  corporateReason: string | null;
  companyName: string | null;
  companySegment: string | null;
  cpf: string | null;
  birthdate: string | null;
  cep: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  number: string;
  city: string;
  uf: string;
  profileImage: string | null;
  establishmentFacadeImage: string | null;
  establishmentInteriorImage: string | null;
  feedbackStars: number;
  nameOperationResponsible: string | null;
  phoneOperationResponsible: string | null;
  createdAt: string;
  userId: string;
}

export async function getContractorById(contractorId: string): Promise<PublicContractorProfile> {
  const response = await apiFetch(`${API_BASE_URL}/contractors/${contractorId}`, {
    method: "GET",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível carregar o perfil do contratante.");
  }

  const raw = body?.data ?? body;
  const data = Array.isArray(raw) ? raw[0] : raw;
  return data as PublicContractorProfile;
}

// ── Contractor Settings ─────────────────────────────────────────
export interface ContractorSettings {
  id: string;
  contractorId: string;
  notifCandidaturas: boolean;
  notifMensagens: boolean;
  notifAvaliacoes: boolean;
  notifPagamentos: boolean;
  notifEmail: boolean;
  notifPush: boolean;
  perfilPublico: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSettingsPayload {
  notifCandidaturas?: boolean;
  notifMensagens?: boolean;
  notifAvaliacoes?: boolean;
  notifPagamentos?: boolean;
  notifEmail?: boolean;
  notifPush?: boolean;
  perfilPublico?: boolean;
}

export async function getContractorSettings(contractorId: string): Promise<ContractorSettings> {
  const response = await apiFetch(`${API_BASE_URL}/contractors/${contractorId}/settings`, {
    method: "GET",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível carregar as configurações.");
  }

  const raw = body?.data ?? body;
  const data = Array.isArray(raw) ? raw[0] : raw;
  return data as ContractorSettings;
}

export async function updateContractorSettings(contractorId: string, settings: UpsertSettingsPayload): Promise<ContractorSettings> {
  const response = await apiFetch(`${API_BASE_URL}/contractors/${contractorId}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível salvar as configurações.");
  }

  const raw = body?.data ?? body;
  const data = Array.isArray(raw) ? raw[0] : raw;
  return data as ContractorSettings;
}

// ── Password Recovery ───────────────────────────────────────────

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Solicita código de recuperação de senha.
 * IMPORTANTE: Resposta genérica — não revela se o email existe (BR-FP04).
 */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  const response = await apiFetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    skipAuth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: payload.email.toLowerCase().trim() }),
  });

  const body = await response.json().catch(() => null);

  // Mesmo se email não existir, API retorna 200 com mensagem genérica
  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível solicitar a recuperação. Tente novamente.");
  }

  if (!body?.success) {
    throw new Error(body?.message || "Não foi possível solicitar a recuperação. Tente novamente.");
  }

  return body as ForgotPasswordResponse;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Redefine a senha usando código de recuperação válido.
 * @throws 401 se o código for inválido ou expirado
 */
export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  const response = await apiFetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    skipAuth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email.toLowerCase().trim(),
      code: payload.code.trim(),
      password: payload.password,
    }),
  });

  const body = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Código inválido ou expirado. Solicite um novo código.");
  }

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível redefinir a senha. Tente novamente.");
  }

  if (!body?.success) {
    throw new Error(body?.message || "Não foi possível redefinir a senha. Tente novamente.");
  }

  return body as ResetPasswordResponse;
}

// ── Provider Availability ────────────────────────────────────

export interface ProviderAvailability {
  diasAtivos: string[];
  horarios: Record<string, { de: string; ate: string }>;
}

export interface UpdateProviderAvailabilityPayload {
  diasAtivos: string[];
  horarios: Record<string, { de: string; ate: string }>;
}

export interface UpdateProviderAvailabilityResponse {
  success: boolean;
  message: string;
  data?: ProviderAvailability;
}

/**
 * Atualiza a disponibilidade de horários do freelancer.
 * @param payload Dias ativos e horários para cada dia
 * @returns Confirmação da atualização
 * @throws Error se validação falhar ou houver problema na persistência
 */
export async function updateProviderAvailability(
  payload: UpdateProviderAvailabilityPayload,
): Promise<UpdateProviderAvailabilityResponse> {
  const response = await apiFetch(`${API_BASE_URL}/users/providers`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (response.status === 422) {
    throw new Error(body?.message || 'Validação de horários falhou. Verifique se "até" é posterior a "de".');
  }

  if (response.status === 401) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    throw new Error(body?.message || 'Não foi possível atualizar a disponibilidade. Tente novamente.');
  }

  if (!body?.success) {
    throw new Error(body?.message || 'Falha ao atualizar disponibilidade.');
  }

  return body as UpdateProviderAvailabilityResponse;
}
