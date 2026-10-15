import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Use ao menos 8 caracteres")
  .max(72, "Use no máximo 72 caracteres") // limite do bcrypt, já pensando no backend
  .regex(/[A-Za-z]/, "Inclua ao menos uma letra")
  .regex(/\d/, "Inclua ao menos um número");