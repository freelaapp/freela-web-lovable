import { z } from "zod";

/**
 * Schema para solicitação de recuperação de senha (esqueci minha senha).
 * Regras:
 * - Email obrigatório, válido e em formato minúsculo
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido")
    .transform((email) => email.toLowerCase().trim()),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
