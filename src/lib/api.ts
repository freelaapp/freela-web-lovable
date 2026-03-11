const API_BASE_URL = "https://api.freelaservicos.com.br";

// Trocar para "mobile" quando necessário
const ORIGIN_TYPE = "Web";

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
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Origin-type": ORIGIN_TYPE,
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
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Origin-type": ORIGIN_TYPE,
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
  const response = await fetch(
    `${API_BASE_URL}/users/generate-email-confirmation-code?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Origin-type": ORIGIN_TYPE,
      },
    },
  );

  if (response.status !== 200) {
    throw new Error("Não foi possível enviar o código de confirmação. Verifique o e-mail e tente novamente.");
  }
}

export async function confirmEmail(email: string, code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/confirm-email`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Origin-type": ORIGIN_TYPE,
    },
    body: JSON.stringify({ code, email, createdAt: new Date().toISOString() }),
  });

  if (response.status !== 200) {
    throw new Error("Código inválido ou expirado. Tente novamente.");
  }
}

export async function registerProvider(formData: FormData, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/providers/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Origin-type": ORIGIN_TYPE,
      Authorization: `Bearer ${token}`,
    },
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
  const response = await fetch(`${API_BASE_URL}/users/contractors`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Origin-type": ORIGIN_TYPE,
      Authorization: `Bearer ${token}`,
    },
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
  vacancy: {
    id: string;
    status: string;
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

  if (response.status === 409) {
    throw new Error("Esta candidatura já foi aceita ou recusada anteriormente.");
  }
  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível recusar a candidatura. Tente novamente.");
  }

  return body.data as CandidacyActionResponse;
}

export async function createVacancy(payload: CreateVacancyPayload, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/vacancies`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Origin-type": ORIGIN_TYPE,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Não foi possível criar a vaga. Tente novamente.");
  }
}
