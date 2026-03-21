import { z } from "zod";

/**
 * Schema para redefinição de senha com código de recuperação.
 * Regras:
 * - Email: obrigatório e válido
 * - Code: 6 dígitos numéricos (BR-FP02)
 * - Password: mínimo 6 caracteres (BR-FP05)
 */
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido")
    .transform((email) => email.toLowerCase().trim()),
  code: z
    .string()
    .min(6, "Código deve ter 6 dígitos")
    .max(6, "Código deve ter 6 dígitos")
    .regex(/^\d+$/, "Código deve conter apenas números")
    .transform((code) => code.trim()),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha muito longa"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
