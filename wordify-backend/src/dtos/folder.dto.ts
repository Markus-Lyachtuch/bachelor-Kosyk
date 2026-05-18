import z from "zod";

export const folderSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Folder name is required")
      .max(100, "Folder name must be at most 100 characters"),
  }),
});

export type CreateFolderInput = z.infer<typeof folderSchema>["body"];
