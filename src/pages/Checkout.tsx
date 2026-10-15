import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../components/FormField";
import { checkoutSchema, type CheckoutFormData } from "../lib/checkoutSchema";
import { formatBRL } from "../lib/format";
import { useCreateOrder } from "../hooks/useOrders";
import { selectTotal, useCart } from "../store/cartStore";
import { useRef } from "react";

const inputClass =
    "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function Checkout() {
    const navigate = useNavigate();
    const orderPlaced = useRef(false);
    const items = useCart((s) => s.items);
    const total = useCart(selectTotal);
    const clear = useCart((s) => s.clear);

    const { mutate, isPending, isError } = useCreateOrder();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { name: "", email: "", phone: "", cep: "", address: "", city: "" },
    });

    if (items.length === 0 && !orderPlaced.current) {
        return <Navigate to="/carrinho" replace />;
    }

    function onSubmit(customer: CheckoutFormData) {
        mutate(
            {
                customer,
                total,
                items: items.map(({ product, quantity }) => ({
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity,
                })),
            },
            {
                onSuccess: (order) => {
                    orderPlaced.current = true;
                    navigate(`/pagamento/${order.id}`, { replace: true });
                    clear();
                },
            }
        );
    }

    return (
        <section>
            <h1 className="mb-6 text-2xl font-bold">Finalizar pedido</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4 rounded-xl border bg-white p-6 lg:col-span-2"
                >
                    <FormField label="Nome completo" error={errors.name?.message}>
                        <input {...register("name")} autoComplete="name" className={inputClass} />
                    </FormField>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="E-mail" error={errors.email?.message}>
                            <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
                        </FormField>
                        <FormField label="Telefone" error={errors.phone?.message}>
                            <input {...register("phone")} type="tel" placeholder="(32) 99999-9999" autoComplete="tel" className={inputClass} />
                        </FormField>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormField label="CEP" error={errors.cep?.message}>
                            <input {...register("cep")} inputMode="numeric" placeholder="36000-000" autoComplete="postal-code" className={inputClass} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Cidade" error={errors.city?.message}>
                                <input {...register("city")} autoComplete="address-level2" className={inputClass} />
                            </FormField>
                        </div>
                    </div>

                    <FormField label="Endereço (rua e número)" error={errors.address?.message}>
                        <input {...register("address")} autoComplete="street-address" className={inputClass} />
                    </FormField>

                    {isError && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            Não foi possível registrar o pedido. Tente novamente.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isPending ? "Enviando pedido..." : "Confirmar pedido"}
                    </button>
                </form>

                <aside className="h-fit rounded-xl border bg-white p-6">
                    <h2 className="mb-4 text-lg font-semibold">Resumo</h2>
                    <ul className="space-y-3 text-sm">
                        {items.map(({ product, quantity }) => (
                            <li key={product.id} className="flex justify-between gap-3">
                                <span>
                                    {quantity}× {product.name}
                                </span>
                                <span className="font-medium">{formatBRL(product.price * quantity)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
                        <span>Total</span>
                        <span>{formatBRL(total)}</span>
                    </div>
                </aside>
            </div>
        </section>
    );
}