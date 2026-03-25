import { describe, it, expect } from "vitest";
import { resetPasswordSchema, ResetPasswordFormData } from "../reset-password.schema";

describe("resetPasswordSchema", () => {
  it("deve validar dados corretos", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "123456",
      password: "novaSenha123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
      expect(result.data.code).toBe("123456");
      expect(result.data.password).toBe("novaSenha123");
    }
  });

  it("deve transformar email para minúsculo e remover espaços", () => {
    const result = resetPasswordSchema.safeParse({
      email: "  TEST@EXAMPLE.COM  ",
      code: "123456",
      password: "novaSenha123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("deve transformar code para string sem espaços", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "  123456  ",
      password: "novaSenha123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("123456");
    }
  });

  it("deve rejeitar email vazio", () => {
    const result = resetPasswordSchema.safeParse({
      email: "",
      code: "123456",
      password: "novaSenha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.find(e => e.path[0] === "email")?.message).toBe("Ops! Não esqueça de preencher o e-mail.");
    }
  });

  it("deve rejeitar email inválido", () => {
    const result = resetPasswordSchema.safeParse({
      email: "invalid-email",
      code: "123456",
      password: "novaSenha123",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar código com menos de 6 dígitos", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "12345",
      password: "novaSenha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.find(e => e.path[0] === "code")?.message).toBe("Digite o código de 6 dígitos.");
    }
  });

  it("deve rejeitar código com mais de 6 dígitos", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "1234567",
      password: "novaSenha123",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar código com letras", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "abc123",
      password: "novaSenha123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.find(e => e.path[0] === "code")?.message).toBe("O código deve conter apenas números.");
    }
  });

  it("deve rejeitar senha com menos de 6 caracteres", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "123456",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.find(e => e.path[0] === "password")?.message).toBe("Sua senha precisa ter pelo menos 6 caracteres.");
    }
  });

  it("deve aceitar senha com exatamente 6 caracteres", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
      code: "123456",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar todos os campos obrigatórios faltando", () => {
    const result = resetPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.errors.map(e => e.path[0]);
      expect(paths).toContain("email");
      expect(paths).toContain("code");
      expect(paths).toContain("password");
    }
  });
});
