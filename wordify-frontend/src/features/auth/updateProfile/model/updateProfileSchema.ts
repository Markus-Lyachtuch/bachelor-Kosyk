import { z } from "zod";
import { passwordSchema } from "features/auth/common";
import { MAX_SIZE_IMAGE_AVATAR, IMAGE_ALLOWED_FILE_TYPES } from "shared/const/file";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .optional()
      .or(z.literal("")),
    email: z.email("Invalid email format").optional().or(z.literal("")),
    password: z
      .string()
      .refine((val) => val === "" || passwordSchema.safeParse(val).success, {
        message: "Password must be 8-15 chars, with at least one uppercase letter and one special character",
      })
      .optional(),
    currentPassword: z.string().optional(),
    avatar: z
      .any()
      .optional()
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_SIZE_IMAGE_AVATAR;
      }, "Max image size is 2MB.")
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return IMAGE_ALLOWED_FILE_TYPES.includes(files[0]?.type);
      }, "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."),
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
  );

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
