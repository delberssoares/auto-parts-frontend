import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome (mín. 3 caracteres)"),
  brand: z.string().trim().min(2, "Informe a marca"),
  category_id: z
    .number({ message: "Selecione uma categoria" })
    .int()
    .positive("Selecione uma categoria"),
  price: z.number({ message: "Informe o preço" }).positive("O preço deve ser maior que zero"),
  stock: z.number({ message: "Informe o estoque" }).int("Use um número inteiro").min(0, "O estoque não pode ser negativo"),
  image_url: z.string().trim().url("URL inválida").or(z.literal("")),
  description: z.string().trim().min(10, "Descreva o produto (mín. 10 caracteres)"),
});

export type ProductFormData = z.infer<typeof productSchema>;