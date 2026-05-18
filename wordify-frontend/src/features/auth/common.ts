import z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(15, "Password must be at most 15 characters")
  .refine(
    (val) => /[A-Z]/.test(val),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (val) => /[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?]/.test(val),
    "Password must contain at least one special character"
  );
