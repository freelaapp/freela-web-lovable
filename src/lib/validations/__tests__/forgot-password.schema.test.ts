import { describe, it, expect } from "vitest";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../forgot-password.schema";

describe("forgotPasswordSchema", () => {
  it("deve validar email correto", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("deve transformar email para minúsculo", () => {
    const result = forgotPasswordSchema.safeParse({ email: "TEST@EXAMPLE.COM" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("deve remover espaços em branco", () => {
    const result = forgotPasswordSchema.safeParse({ email: "  test@example.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("deve rejeitar email vazio", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Email é obrigatório");
    }
  });

  it("deve rejeitar email inválido", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Digite um email válido");
    }
  });

  it("deve rejeitar email sem arroba", () => {
    const result = forgotPasswordSchema.safeParse({ email: "testexample.com" });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar email sem domínio", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@" });
    expect(result.success).toBe(false);
  });

  it("deve aceitar email com subdomínio", () => {
    const result = forgotPasswordSchema.safeParse({ email: "user@sub.example.com" });
    expect(result.success).toBe(true);
  });
});
