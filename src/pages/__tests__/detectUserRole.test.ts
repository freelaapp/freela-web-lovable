import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, SessionExpiredError } from "@/lib/api";

// Mock the API fetch function
vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
  SessionExpiredError: class SessionExpiredError extends Error {
    constructor() {
      super("Sessão expirada. Faça login novamente.");
      this.name = "SessionExpiredError";
    }
  },
}));

// Import after mocking
import { detectUserRole } from "@/pages/Login";

describe("detectUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 'contratante' when activeRole is 'contractor'", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { activeRole: "contractor", contractor: { id: "123" }, provider: { id: "456" } },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("contratante");
  });

  it("should return 'freelancer' when activeRole is 'provider'", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { activeRole: "provider", contractor: { id: "123" }, provider: { id: "456" } },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when activeRole is missing", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { contractor: { id: "123" }, provider: { id: "456" } },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when activeRole is null", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { activeRole: null, contractor: { id: "123" }, provider: { id: "456" } },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when activeRole is undefined", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { contractor: { id: "123" }, provider: { id: "456" } },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when success is false", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        data: { id: "contractor-123" },
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when data is string (invalid type)", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: "some_random_string",
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when data is number (invalid type)", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: 123,
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when data is boolean (invalid type)", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: true,
      }),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' on server error (500)", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should throw SessionExpiredError on 401", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as unknown as Response);

    await expect(detectUserRole()).rejects.toThrow(SessionExpiredError);
  });

  it("should return 'freelancer' on network error", async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error("Network error"));

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });

  it("should return 'freelancer' when JSON parsing fails", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Response);

    const result = await detectUserRole();
    expect(result).toBe("freelancer");
  });
});
