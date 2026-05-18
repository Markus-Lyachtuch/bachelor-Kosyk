import { z } from "zod";

const boolFieldUpdateOperationsSchema = z.union([
  z.boolean(),
  z.object({
      set: z.boolean(),
    })
    .strict(),
]);

export const setSettingsSchema = z.object({
  body: z
    .object({
      isForgettingCurveEnabled: boolFieldUpdateOperationsSchema.optional(),
      isAutoPlayAudioEnabled: boolFieldUpdateOperationsSchema.optional(),
    })
    .strict()
    .refine(
      (obj) =>
        Object.entries(obj).filter(([, v]) => v !== undefined).length >= 1,
      "At least one setting field must be provided",
    ),
});

export type SetSettingsInput = z.infer<typeof setSettingsSchema>["body"];
