import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(15, "Password must be at most 15 characters")
  .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  .refine(
    (val) => /[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?]/.test(val),
    "Password must contain at least one special character",
  );

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: passwordSchema,
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
        .optional(),
      email: z.string().email("Invalid email format").optional(),
      password: passwordSchema.optional(),
      currentPassword: z.string().min(1, "Current password is required").optional(),
    })
    .refine(
      (data) => {
        if (data.password && !data.currentPassword) return false;
        return true;
      },
      {
        message: "Current password is required when setting a new password",
        path: ["currentPassword"],
      },
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
