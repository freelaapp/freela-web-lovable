const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.freelaservicos.com.br";
const ORIGIN_TYPE = "Web";

/** Single-flight guard for concurrent refresh calls */
let refreshPromise: Promise<boolean> | null = null;

/** Decode a JWT payload without external libraries */
function decodeJwt(token: string): { sub: string; exp: number; [key: string]: unknown } {
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
export function onAuthSuccess(accessToken: string, refreshToken?: string): void {
  // 1. Save access token
  localStorage.setItem("authToken", JSON.stringify(accessToken));

  // 2. Save refresh token (returned in body, not httpOnly cookie)
  if (refreshToken) {
    localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
  }

  // 3. Decode JWT — API uses "sub" as the user ID claim
  const decoded = decodeJwt(accessToken);

  // 4. Save minimal user (sub = userId)
  localStorage.setItem("authUser", JSON.stringify({ id: decoded.sub }));

  // 5. Save absolute expiration time
  const expirationTime = decoded.exp * 1000;
  localStorage.setItem("authTokenExpirationTime", JSON.stringify(expirationTime));
}

/** Attempt to refresh the auth token using the stored refresh token */
export function refreshAuthToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const parsedRefreshToken = storedRefreshToken ? JSON.parse(storedRefreshToken) : null;

      const response = await fetch(`${API_BASE_URL}/users/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Origin-type": ORIGIN_TYPE,
          ...(parsedRefreshToken ? { Authorization: `Bearer ${parsedRefreshToken}` } : {}),
        },
        body: JSON.stringify({}),
      });

      const body = await response.json().catch(() => null);

      // Formato novo: { data: { accessToken, refreshToken } }
      const newAccessToken = body?.data?.accessToken ?? (typeof body?.data === "string" ? body.data : null);
      const newRefreshToken = body?.data?.refreshToken ?? null;

      if (response.ok && newAccessToken) {
        onAuthSuccess(newAccessToken, newRefreshToken ?? undefined);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/** Clear all auth data from localStorage */
export function logout(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
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

  // Token still valid — ensure authUser exists
  try {
    const existing = localStorage.getItem("authUser");
    const parsed = existing ? JSON.parse(existing) : null;
    if (!parsed?.id) {
      const token = JSON.parse(tokenRaw);
      const decoded = decodeJwt(token);
      localStorage.setItem("authUser", JSON.stringify({ id: decoded.sub }));
    }
  } catch {
    try {
      const token = JSON.parse(tokenRaw);
      const decoded = decodeJwt(token);
      localStorage.setItem("authUser", JSON.stringify({ id: decoded.sub }));
    } catch {
      logout();
      return false;
    }
  }

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
