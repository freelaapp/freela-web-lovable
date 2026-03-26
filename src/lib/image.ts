const API_BASE_URL = import.meta.env.API_BASE_URL as string | undefined;

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;
const DOMAIN_LIKE_REGEX = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?$/i;

function normalizeStringUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("data:image/") || value.startsWith("blob:")) return value;

  if (value.startsWith("//")) return `https:${value}`;

  if (ABSOLUTE_URL_REGEX.test(value)) {
    if (value.startsWith("http://")) {
      try {
        const parsed = new URL(value);
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          return value;
        }
      } catch {
        return value;
      }
      return value.replace("http://", "https://");
    }
    return value;
  }

  if (value.startsWith("/") && API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${value}`;
  }

  if (value.startsWith("www.") || DOMAIN_LIKE_REGEX.test(value)) {
    return `https://${value.replace(/^\/+/, "")}`;
  }

  return value;
}

function bufferToDataUrl(input: { type?: unknown; data?: unknown }): string | null {
  if (input?.type !== "Buffer" || !Array.isArray(input.data)) return null;

  const bytes = new Uint8Array(input.data as number[]);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:image/jpeg;base64,${btoa(binary)}`;
}

export function normalizeImageUrl(input: unknown): string | null {
  if (!input) return null;

  if (typeof input === "string") return normalizeStringUrl(input);

  if (typeof input === "object") {
    const maybeBuffer = bufferToDataUrl(input as { type?: unknown; data?: unknown });
    if (maybeBuffer) return maybeBuffer;

    const objectInput = input as Record<string, unknown>;
    const nestedCandidates = [
      objectInput.url,
      objectInput.uri,
      objectInput.src,
      objectInput.location,
      objectInput.href,
      objectInput.secure_url,
    ];

    for (const candidate of nestedCandidates) {
      const normalized = normalizeImageUrl(candidate);
      if (normalized) return normalized;
    }
  }

  return null;
}

export function pickImageUrlFromPayload(
  payload: Record<string, unknown> | null | undefined,
  fieldCandidates: string[],
): string | null {
  if (!payload) return null;

  for (const field of fieldCandidates) {
    const normalized = normalizeImageUrl(payload[field]);
    if (normalized) return normalized;
  }

  return null;
}
