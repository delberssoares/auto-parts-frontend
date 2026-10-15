import { z } from "zod";

export const carriers = ["Correios", "Jadlog", "Loggi", "Transportadora própria"] as const;

export const shippingSchema = z.object({
  carrier: z.string().min(1, "Selecione a transportadora"),
  tracking_code: z
    .string()
    .trim()
    .min(8, "Código muito curto")
    .max(30, "Código muito longo")
    .regex(/^[A-Za-z0-9-]+$/, "Use apenas letras, números e hífen"),
  estimated_delivery: z.string().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;