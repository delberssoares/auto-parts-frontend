import { Link, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import { useCreateProduct, useProduct, useUpdateProduct } from "../hooks/useProducts";
import type { ProductFormData } from "../lib/productSchema";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);
  const isEdit = id !== undefined;

  const { data: product, isLoading, isError } = useProduct(productId);
  const create = useCreateProduct();
  const update = useUpdateProduct(productId);

  const mutation = isEdit ? update : create;

  function handleSubmit(data: ProductFormData) {
    mutation.mutate(data, {
      onSuccess: () => navigate("/admin/produtos"),
    });
  }

  if (isEdit && isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-slate-200" />;
  }

  if (isEdit && (isError || !product)) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Produto não encontrado.</p>
        <Link to="/admin/produtos" className="mt-4 inline-block text-blue-700 underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <section>
      <Link to="/admin/produtos" className="mb-4 inline-block text-sm text-blue-700 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? "Editar produto" : "Novo produto"}</h1>

      <ProductForm
        key={product?.id ?? "new"}
        product={product}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? (mutation.error as Error).message : undefined}
        onSubmit={handleSubmit}
      />
    </section>
  );
}