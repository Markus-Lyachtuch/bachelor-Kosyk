import { passwordSchema } from "features/auth/common";
import { z } from "zod";

export const forgetPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
