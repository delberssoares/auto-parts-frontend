import { z } from "zod";

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
  address: z.string().trim().min(5, "Informe o endereço com número"),
  city: z.string().trim().min(2, "Informe a cidade"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;