import { z } from "zod";

const requiredText = z.string().trim().min(1);

export const runCommandSchema = z.object({
  cmd: requiredText,
});

export const sinceIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return parsed;
  });

export const packPayloadSchema = z.object({
  provider: requiredText,
  summary: requiredText,
  stake: requiredText,
  price: requiredText,
  domain: requiredText,
  termination: requiredText,
});
