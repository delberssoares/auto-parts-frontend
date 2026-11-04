import { useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../components/FormField";
import { useCepLookup } from "../hooks/useCepLookup";
import { useCreateOrder } from "../hooks/useOrders";
import { checkoutSchema, UFS, type CheckoutFormData } from "../lib/checkoutSchema";
import { formatBRL } from "../lib/format";
import { maskCep, maskPhone } from "../lib/masks";
import { useAuth } from "../store/authStore";
import { selectTotal, useCart } from "../store/cartStore";
import type { Customer } from "../types";

const inputClass =
  "h-11 w-full rounded-md border bg-white px-3 outline-none focus-visible:ring-2 focus-visible:ring-garage-500";

// A API guarda endereço e cidade como texto: junta os campos aqui
function toCustomer(data: CheckoutFormData): Customer {
  const complement = data.complement ? ` - ${data.complement}` : "";
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    cep: data.cep,
    address: `${data.street}, ${data.number}${complement} - ${data.neighborhood}`,
    city: `${data.city}/${data.state}`,
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const orderPlaced = useRef(false);
  const user = useAuth((s) => s.user);
  const items = useCart((s) => s.items);
  const total = useCart(selectTotal);
  const clear = useCart((s) => s.clear);

  const { mutate, isPending, isError, error } = useCreateOrder();
  const { status: cepStatus, lookup, reset: resetCep } = useCepLookup();

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  // Depois do pedido criado o carrinho esvazia: não redirecionar nesse caso
  if (items.length === 0 && !orderPlaced.current) {
    return <Navigate to="/carrinho" replace />;
  }

  function fill(field: "street" | "neighborhood" | "city" | "state", value: string) {
    setValue(field, value, { shouldValidate: Boolean(value), shouldDirty: true });
  }

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    setValue("cep", masked, { shouldValidate: isSubmitted });

    if (masked.replace(/\D/g, "").length < 8) {
      resetCep();
      return;
    }

    const address = await lookup(masked);
    if (!address) return;

    fill("street", address.street);
    fill("neighborhood", address.neighborhood);
    fill("city", address.city);
    fill("state", address.state);

    // CEP de cidade pequena pode vir sem rua: deixa a pessoa preencher
    setFocus(address.street ? "number" : "street");
  }

  function onSubmit(data: CheckoutFormData) {
    mutate(
      {
        customer: toCustomer(data),
        items: items.map(({ product, quantity }) => ({ product_id: product.id, quantity })),
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

  const cepMessage = {
    idle: null,
    loading: "Buscando endereço...",
    found: "Endereço encontrado. Confira os dados e informe o número.",
    notfound: "CEP não encontrado. Confira os números ou preencha o endereço.",
    error: "Não foi possível buscar o endereço agora. Preencha manualmente.",
  }[cepStatus];

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-bold">Finalizar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-8 rounded-lg border bg-white p-5 sm:p-6"
        >
          <section aria-labelledby="contato" className="space-y-4">
            <h2 id="contato" className="font-display text-xl font-semibold">
              Contato
            </h2>

            <FormField label="Nome completo" error={errors.name?.message}>
              <input {...register("name")} autoComplete="name" className={inputClass} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="E-mail" error={errors.email?.message}>
                <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
              </FormField>
              <FormField label="Telefone" error={errors.phone?.message}>
                <input
                  {...register("phone", {
                    onChange: (e) => setValue("phone", maskPhone(e.target.value), { shouldValidate: isSubmitted }),
                  })}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(32) 99999-9999"
                  className={inputClass}
                />
              </FormField>
            </div>
          </section>

          <section aria-labelledby="entrega">
            <h2 id="entrega" className="font-display text-xl font-semibold">
              Entrega
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <FormField label="CEP" error={errors.cep?.message}>
                  <input
                    {...register("cep", { onChange: (e) => handleCepChange(e.target.value) })}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={9}
                    placeholder="00000-000"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="text-sm text-muted sm:col-span-4 sm:self-end sm:pb-3">
                {cepMessage ? (
                  <p role="status" aria-live="polite">
                    {cepMessage}
                  </p>
                ) : null}
                {(cepStatus === "idle" || cepStatus === "notfound" || cepStatus === "error") && (
                  <a
                    href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-garage-700 underline"
                  >
                    Não sei meu CEP
                  </a>
                )}
              </div>

              <div className="sm:col-span-6">
                <FormField label="Rua" error={errors.street?.message}>
                  <input {...register("street")} autoComplete="address-line1" className={inputClass} />
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField label="Número" error={errors.number?.message}>
                  <input
                    {...register("number")}
                    autoComplete="off"
                    placeholder="123 ou S/N"
                    className={inputClass}
                  />
                </FormField>
              </div>
              <div className="sm:col-span-4">
                <FormField label="Complemento (opcional)" error={errors.complement?.message}>
                  <input
                    {...register("complement")}
                    autoComplete="address-line2"
                    placeholder="Apto, bloco, referência"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="sm:col-span-6">
                <FormField label="Bairro" error={errors.neighborhood?.message}>
                  <input {...register("neighborhood")} className={inputClass} />
                </FormField>
              </div>

              <div className="sm:col-span-4">
                <FormField label="Cidade" error={errors.city?.message}>
                  <input {...register("city")} autoComplete="address-level2" className={inputClass} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Estado" error={errors.state?.message}>
                  <select {...register("state")} autoComplete="address-level1" className={inputClass}>
                    <option value="">UF</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
          </section>

          {isError && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <p>{(error as Error).message}</p>
              <Link to="/carrinho" className="mt-1 inline-block font-medium underline">
                Ajustar carrinho
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || cepStatus === "loading"}
            className="h-12 w-full rounded-md bg-brass font-semibold text-garage-950 transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {isPending ? "Enviando pedido..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="order-first h-fit rounded-lg border bg-white p-5 sm:p-6 lg:sticky lg:top-24 lg:order-none">
          <h2 className="font-display text-xl font-semibold">Resumo</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span>
                  {quantity}× {product.name}
                </span>
                <span className="shrink-0 font-medium">{formatBRL(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <span className="font-display text-3xl font-bold">{formatBRL(total)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}