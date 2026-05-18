import z from "zod";

export const folderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100, "Folder name must be at most 100 characters"),
});

export type FolderFormData = z.infer<typeof folderSchema>;
