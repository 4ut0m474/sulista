import { z } from "zod";

// Max lengths for inputs
export const MAX_NAME = 100;
export const MAX_DESCRIPTION = 500;
export const MAX_URL = 2000;
export const MAX_DATE = 20;
export const MAX_CATEGORY = 50;
export const MAX_PRIZE = 100;
export const MAX_COMMENT = 1000;
export const MAX_PHONE = 30;
export const MAX_EMAIL = 255;
export const MAX_PASSWORD = 128;
export const MAX_DOCUMENT_ID = 20;

// Sanitize text input - strip control chars, trim
export const sanitizeText = (input: string): string => {
  // Remove null bytes and other control characters (keep newlines/tabs for textareas)
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
};

// Validate URL format (basic check)
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // empty is ok
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  if (!email) return true;
  return z.string().email().safeParse(email).success;
};

// Validate phone format (digits, spaces, parens, dashes, plus)
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true;
  return /^[\d\s()\-+]+$/.test(phone) && phone.replace(/\D/g, "").length >= 8;
};

export const persistenceIdentitySchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo").max(MAX_NAME, `Nome deve ter no máximo ${MAX_NAME} caracteres`),
  documentType: z.enum(["cpf", "rg"]),
  documentId: z
    .string()
    .trim()
    .min(7, "Informe um CPF ou RG válido")
    .max(MAX_DOCUMENT_ID, `Documento deve ter no máximo ${MAX_DOCUMENT_ID} caracteres`)
    .regex(/^[0-9A-Za-z.\-/\s]+$/, "Documento inválido"),
});

// Admin edit item schema
export const editItemSchema = z.object({
  name: z.string().max(MAX_NAME, `Nome deve ter no máximo ${MAX_NAME} caracteres`),
  description: z.string().max(MAX_DESCRIPTION, `Descrição deve ter no máximo ${MAX_DESCRIPTION} caracteres`).optional(),
  image: z.string().max(MAX_URL, `URL deve ter no máximo ${MAX_URL} caracteres`).optional(),
  date: z.string().max(MAX_DATE, `Data deve ter no máximo ${MAX_DATE} caracteres`).optional(),
  category: z.string().max(MAX_CATEGORY, `Categoria deve ter no máximo ${MAX_CATEGORY} caracteres`).optional(),
  prize: z.string().max(MAX_PRIZE, `Prêmio deve ter no máximo ${MAX_PRIZE} caracteres`).optional(),
});

// Global config schema
export const globalConfigSchema = z.object({
  whatsapp: z.string().max(MAX_PHONE).refine(isValidPhone, "Formato de telefone inválido"),
  email: z.string().max(MAX_EMAIL).refine(isValidEmail, "Formato de e-mail inválido"),
});

// Opinion comment schema
export const opinionSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comentário obrigatório").max(MAX_COMMENT, `Comentário deve ter no máximo ${MAX_COMMENT} caracteres`),
});
