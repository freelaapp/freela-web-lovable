import { z } from "zod";
import { errorMessages } from "../error-messages";

/**
 * Schema para solicitação de recuperação de senha (esqueci minha senha).
 * Regras:
 * - Email obrigatório, válido e em formato minúsculo
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, errorMessages.required(errorMessages.fields.email))
    .email(errorMessages.invalidEmail)
    .transform((email) => email.toLowerCase().trim()),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
