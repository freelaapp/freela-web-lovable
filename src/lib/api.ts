const API_BASE_URL = "https://api.freelaservicos.com.br";

// Trocar para "mobile" quando necessário
const ORIGIN_TYPE = "web";

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
    credentials: "include", // para receber o refreshToken via cookie
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
