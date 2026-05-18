import {
  IMAGE_ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE_IMAGE,
  MAX_SIZE_WORDS_FILE,
  MODAL_SET_CREATE_ALLOWED_FILE_TYPES,
} from "shared/const/file";
import z from "zod";

const uploadFileValidation = (fileTypes: string[], maxSize: number = MAX_SIZE_WORDS_FILE) =>
  z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Uploaded file is required",
    })
    .refine((file) => file.size <= maxSize, {
      message: `File size must be less than ${maxSize / (1024 * 1024)} MB`,
    })
    .refine(
      (file) => {
        const allowed = fileTypes.map((t) => t.toLowerCase());
        const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
        const mime = (file.type ?? "").toLowerCase();
        return allowed.includes(mime) || allowed.includes(ext);
      },
      {
        message: "File type is not supported",
      },
    );

export const setSchemaStep1 = z
  .object({
    name: z
      .string()
      .min(1, "Set name is required")
      .max(240, "Set name must be at most 240 characters"),
    folderId: z.number().min(1, "Folder selection is required"),
    uploadedFile: z.union([
      z.undefined(),
      uploadFileValidation(MODAL_SET_CREATE_ALLOWED_FILE_TYPES),
    ]),
    separator: z.string().optional(),
  })
  .refine((data) => !data.uploadedFile || !!data.separator, {
    message: "Separator is required when file is uploaded",
    path: ["separator"],
  });

export const setSchemaStep2 = z.object({
  setImageFile: z.union([
    z.undefined(),
    uploadFileValidation(IMAGE_ALLOWED_FILE_TYPES, MAX_FILE_SIZE_IMAGE),
  ]),
  words: z
    .array(
      z.object({
        id: z.number().optional(),
        term: z
          .string()
          .trim()
          .min(1, "Term is required")
          .max(255, "Term is too long (maximum 255 characters)")
          .regex(/^[a-zA-Zа-яА-ЯєЄіІїЇґҐ0-9\s\-.,!?"'()]+$/u, {
            message:
              "Term can only contain letters, numbers, spaces, and basic punctuation",
          }),
        definition: z
          .string()
          .max(2000, "Definition is too long (maximum 2000 characters)")
          .optional()
          .or(z.literal("")),
        imageUrl: z
          .string()
          .optional()
          .or(z.literal(""))
          .or(z.null())
          .or(uploadFileValidation(IMAGE_ALLOWED_FILE_TYPES, MAX_FILE_SIZE_IMAGE)),
        index: z.number().int().min(0).optional().or(z.null()),
      }),
    )
    .min(1, "At least one word is required")
    .max(50, "Maximum 50 words in a set")
    .superRefine((words, ctx) => {
      const termCounts = new Map<string, number[]>();
      words.forEach((word, index) => {
        const term = word.term.toLowerCase().trim();
        if (!termCounts.has(term)) {
          termCounts.set(term, []);
        }
        termCounts.get(term)!.push(index);
      });

      for (const [term, indices] of termCounts) {
        if (indices.length > 1) {
          indices.forEach((index) => {
            ctx.addIssue({
              code: "custom",
              message: `Term "${term}" already exists at position ${indices[0] + 1}`,
              path: ["words", index, "term"],
            });
          });
        }
      }

      words.forEach((word, wordIndex) => {
        const hasImageUrl =
          typeof word.imageUrl === "string" &&
          word.imageUrl &&
          word.imageUrl !== "";
        const hasIndex = word.index !== null && word.index !== undefined;

        if (hasImageUrl) {
          try {
            new URL(word.imageUrl! as string);
          } catch {
            ctx.addIssue({
              code: "custom",
              message: "Invalid image URL",
              path: ["words", wordIndex, "imageUrl"],
            });
          }
        }

        if (word.imageUrl === null) {
          if (!hasIndex) {
            ctx.addIssue({
              code: "custom",
              message: "Index is required for uploaded image",
              path: ["words", wordIndex, "index"],
            });
          }
        }
      });
    }),
});

export type SetSchemaStep1 = z.infer<typeof setSchemaStep1>;
export type SetSchemaStep2 = z.infer<typeof setSchemaStep2>;

export interface SetSchemaStep2Extended extends SetSchemaStep2 {
  wordImages: File[];
  setImage: File | null;
}

export type SetSchemaStep1LocalStorage = Omit<
  SetSchemaStep1,
  "uploadedFile"
> & {
  uploadedFile?: File | string;
  fileName: string | null;
};
