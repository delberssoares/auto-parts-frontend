import { z } from "zod";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const checkoutSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z
    .string()
    .trim()
    .refine((v) => /^\d{10,11}$/.test(v.replace(/\D/g, "")), "Telefone inválido (com DDD)"),
  cep: z
    .string()
    .trim()
    .refine((v) => /^\d{8}$/.test(v.replace(/\D/g, "")), "CEP inválido (8 dígitos)"),
  street: z.string().trim().min(3, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número").max(10, "Número muito longo"),
  complement: z.string().trim().max(60, "Complemento muito longo"),
  neighborhood: z.string().trim().min(2, "Informe o bairro"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().refine((v) => (UFS as readonly string[]).includes(v), "Selecione o estado"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;