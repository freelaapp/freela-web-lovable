const API_BASE_URL = import.meta.env.API_BASE_URL;
const ORIGIN_TYPE = "Web";
import { errorMessages } from "./error-messages";

type BackendRole = "contractor" | "provider";
type FrontendRole = "freelancer" | "contratante";

const BACKEND_TO_FRONTEND_MAP: Record<BackendRole, FrontendRole> = {
  contractor: "contratante",
  provider: "freelancer",
};

/** Map backend role to frontend role */
function mapBackendRoleToFrontend(role: BackendRole | undefined): FrontendRole | undefined {
  if (!role) return undefined;
  return BACKEND_TO_FRONTEND_MAP[role];
}

/** Fetch user profiles to determine role when not in JWT */
async function fetchProfilesRole(): Promise<FrontendRole | undefined> {
  try {
    const tokenRaw = localStorage.getItem("authToken");
    if (!tokenRaw) return undefined;

    const token = JSON.parse(tokenRaw);
    const response = await fetch(`${API_BASE_URL}/users/profiles`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Origin-type": ORIGIN_TYPE,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return undefined;

    const body = await response.json().catch(() => null);
    if (!body?.success || !body?.data) return undefined;

    const { activeRole } = body.data;
    if (!activeRole) return undefined;

    return mapBackendRoleToFrontend(activeRole as BackendRole);
  } catch {
    return undefined;
  }
}

/** Single-flight guard for concurrent refresh calls */
let refreshPromise: Promise<boolean> | null = null;

/** Decode a JWT payload without external libraries */
function decodeJwt(token: string): { id: string; exp: number; [key: string]: unknown } {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error(errorMessages.tokenNotFound);
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
  localStorage.setItem("authToken", JSON.stringify(newAuthToken));

  const decoded = decodeJwt(newAuthToken);
  const expirationTime = decoded.exp * 1000;
  localStorage.setItem("authTokenExpirationTime", JSON.stringify(expirationTime));

  const mappedRole = mapBackendRoleToFrontend(decoded.role as BackendRole | undefined);

  const userData: { id: string; role?: FrontendRole } = { id: decoded.id };
  if (mappedRole) {
    userData.role = mappedRole;
  }
  localStorage.setItem("authUser", JSON.stringify(userData));
  
  console.log("[Auth] onAuthSuccess - user saved:", userData);
}

/** Attempt to refresh the auth token using the httpOnly refresh cookie */
export function refreshAuthToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
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
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
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
  const authUserRaw = localStorage.getItem("authUser");

  console.log("[initializeAuth] Checking auth - token exists:", !!tokenRaw, "user:", authUserRaw);

  if (!tokenRaw) {
    console.log("[initializeAuth] No token, returning false");
    return false;
  }

  const expirationTime = expRaw ? JSON.parse(expRaw) : 0;
  const now = Date.now();

  if (now >= expirationTime) {
    const refreshed = await refreshAuthToken();
    if (!refreshed) {
      logout();
      return false;
    }
    return true;
  }

  try {
    const existing = localStorage.getItem("authUser");
    const parsed = existing ? JSON.parse(existing) : null;
    if (!parsed?.id) {
      const token = JSON.parse(tokenRaw);
      const decoded = decodeJwt(token);
      const mappedRole = mapBackendRoleToFrontend(decoded.role as BackendRole | undefined);

      const userData: { id: string; role?: FrontendRole } = { id: decoded.id };
      if (mappedRole) {
        userData.role = mappedRole;
      }
      localStorage.setItem("authUser", JSON.stringify(userData));
    } else if (!parsed.role) {
      const token = JSON.parse(tokenRaw);
      const decoded = decodeJwt(token);
      const mappedRole = mapBackendRoleToFrontend(decoded.role as BackendRole | undefined);

      if (mappedRole) {
        parsed.role = mappedRole;
        localStorage.setItem("authUser", JSON.stringify(parsed));
      } else {
        const profilesRole = await fetchProfilesRole();
        if (profilesRole) {
          parsed.role = profilesRole;
          localStorage.setItem("authUser", JSON.stringify(parsed));
        }
      }
    }
  } catch {
    try {
      const token = JSON.parse(tokenRaw);
      const decoded = decodeJwt(token);
      const mappedRole = mapBackendRoleToFrontend(decoded.role as BackendRole | undefined);

      const userData: { id: string; role?: FrontendRole } = { id: decoded.id };
      if (mappedRole) {
        userData.role = mappedRole;
      }
      localStorage.setItem("authUser", JSON.stringify(userData));
    } catch {
      logout();
      return false;
    }
  }

  console.log("[initializeAuth] Returning true - user is authenticated");
  return true;
}

/** Get the current auth user (id and role if available), or null */
export function getAuthUser(): { id: string; role?: FrontendRole } | null {
  const raw = localStorage.getItem("authUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Set user role in localStorage (single source of truth) */
export function setUserRoleInStorage(role: FrontendRole): void {
  const raw = localStorage.getItem("authUser");
  const user = raw ? JSON.parse(raw) : {};
  user.role = role;
  localStorage.setItem("authUser", JSON.stringify(user));
}
