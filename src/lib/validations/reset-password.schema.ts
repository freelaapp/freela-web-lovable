import { z } from "zod";
import { errorMessages } from "../error-messages";

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
    .min(1, errorMessages.required(errorMessages.fields.email))
    .email(errorMessages.invalidEmail)
    .transform((email) => email.toLowerCase().trim()),
  code: z
    .string()
    .min(6, errorMessages.checkinCodeRequired)
    .max(6, errorMessages.checkinCodeRequired)
    .regex(/^\d+$/, "O código deve conter apenas números.")
    .transform((code) => code.trim()),
  password: z
    .string()
    .min(6, errorMessages.passwordTooShort)
    .max(100, errorMessages.passwordTooLong),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
