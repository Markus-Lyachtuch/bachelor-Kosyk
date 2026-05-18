import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    req.body = schema.parse({ body: req.body }).body;
    next();
  } catch (err) {
    res.status(400).json({ errors: (err as any).errors ?? (err as any).message });
  }
};
