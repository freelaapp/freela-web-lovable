const API_BASE_URL = "https://api.freelaservicos.com.br";
const ORIGIN_TYPE = "Web";

/** Decode a JWT payload without external libraries */
function decodeJwt(token: string): { id: string; exp: number; [key: string]: unknown } {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error("Token JWT inválido.");
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

/** Process a successful auth response (login or register) */
export function onAuthSuccess(newAuthToken: string): void {
  // 1. Save token
  localStorage.setItem("authToken", JSON.stringify(newAuthToken));

  // 2. Decode JWT
  const decoded = decodeJwt(newAuthToken);

  // 3. Save minimal user
  localStorage.setItem("authUser", JSON.stringify({ id: decoded.id }));

  // 4. Save absolute expiration time
  const expirationTime = decoded.exp * 1000;
  localStorage.setItem("authTokenExpirationTime", JSON.stringify(expirationTime));
}

/** Attempt to refresh the auth token using the httpOnly refresh cookie */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Origin-type": ORIGIN_TYPE,
      },
      body: JSON.stringify({}),
    });

    const body = await response.json().catch(() => null);

    if (response.ok && body?.success && typeof body.data === "string") {
      onAuthSuccess(body.data);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/** Clear all auth data from localStorage */
export function logout(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("authTokenExpirationTime");
}

/**
 * Bootstrap authentication on app load / route change.
 * Returns true if user is authenticated, false otherwise.
 * If token is expired, attempts a refresh. If refresh fails, logs out.
 */
export async function initializeAuth(): Promise<boolean> {
  const tokenRaw = localStorage.getItem("authToken");
  const expRaw = localStorage.getItem("authTokenExpirationTime");

  if (!tokenRaw) return false;

  const expirationTime = expRaw ? JSON.parse(expRaw) : 0;
  const now = Date.now();

  if (now >= expirationTime) {
    // Token expired — try refresh
    const refreshed = await refreshAuthToken();
    if (!refreshed) {
      logout();
      return false;
    }
    return true;
  }

  // Token still valid
  return true;
}

/** Get the current auth user id, or null */
export function getAuthUser(): { id: string } | null {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
