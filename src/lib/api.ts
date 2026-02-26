const API_BASE_URL = "https://api.freelaservicos.com.br";

// Trocar para "mobile" quando necessário
const ORIGIN_TYPE = "Web";

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
      headers: {
        "Origin-type": ORIGIN_TYPE,
      },
    },
  );

  if (response.status !== 200) {
    throw new Error("Não foi possível enviar o código de confirmação. Verifique o e-mail e tente novamente.");
  }
}
