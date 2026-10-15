import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "./FormField";
import { useCategories } from "../hooks/useProducts";
import { productSchema, type ProductFormData } from "../lib/productSchema";
import type { Product } from "../types";

interface Props {
  product?: Product;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (data: ProductFormData) => void;
}

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function ProductForm({ product, isPending, errorMessage, onSubmit }: Props) {
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          brand: product.brand,
          category_id: product.category_id,
          price: product.price,
          stock: product.stock,
          image_url: product.image_url,
          description: product.description,
        }
      : { name: "", brand: "", image_url: "", description: "", stock: 0 },
  });

  const imageUrl = watch("image_url");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-6 rounded-xl border bg-white p-6 lg:grid-cols-3"
    >
      <div className="space-y-4 lg:col-span-2">
        <FormField label="Nome da peça" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Marca" error={errors.brand?.message}>
            <input {...register("brand")} className={inputClass} />
          </FormField>
          <FormField label="Categoria" error={errors.category_id?.message}>
            <select {...register("category_id", { valueAsNumber: true })} className={inputClass}>
              <option value="">Selecione...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Preço (R$)" error={errors.price?.message}>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
            />
          </FormField>
          <FormField label="Estoque" error={errors.stock?.message}>
            <input
              {...register("stock", { valueAsNumber: true })}
              type="number"
              step="1"
              min="0"
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Descrição" error={errors.description?.message}>
          <textarea {...register("description")} rows={4} className={inputClass} />
        </FormField>
      </div>

      <div className="space-y-4">
        <FormField label="URL da imagem (opcional)" error={errors.image_url?.message}>
          <input {...register("image_url")} placeholder="https://..." className={inputClass} />
        </FormField>

        <div className="overflow-hidden rounded-lg border bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Pré-visualização"
              className="aspect-[3/2] w-full object-cover"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              onLoad={(e) => (e.currentTarget.style.visibility = "visible")}
            />
          ) : (
            <div className="flex aspect-[3/2] items-center justify-center text-sm text-slate-400">
              Sem imagem (será gerado um placeholder)
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 lg:col-span-3">
        {errorMessage && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-3">
          <Link to="/admin/produtos" className="rounded-lg border px-5 py-2.5 font-medium hover:bg-slate-50">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-700 px-6 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
          </button>
        </div>
      </div>
    </form>
  );
}