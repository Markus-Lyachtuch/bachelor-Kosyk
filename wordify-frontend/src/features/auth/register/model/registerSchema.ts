import { z } from "zod";
import { passwordSchema } from "features/auth/common";

export const registerSchema = z
  .object({
    email: z.email(),
    password: passwordSchema,
    repeatPassword: passwordSchema,
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
