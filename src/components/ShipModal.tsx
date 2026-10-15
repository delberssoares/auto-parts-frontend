import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "./FormField";
import { carriers, shippingSchema, type ShippingFormData } from "../lib/shippingSchema";

interface Props {
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (data: ShippingFormData) => void;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function ShipModal({ isPending, errorMessage, onSubmit, onClose }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { carrier: "", tracking_code: "", estimated_delivery: "" },
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && !isPending && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isPending]);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={() => !isPending && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ship-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="ship-title" className="mb-4 text-lg font-bold">Informar envio</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField label="Transportadora" error={errors.carrier?.message}>
            <select {...register("carrier")} className={inputClass}>
              <option value="">Selecione...</option>
              {carriers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Código de rastreio" error={errors.tracking_code?.message}>
            <input {...register("tracking_code")} placeholder="Ex.: AA123456789BR" className={`${inputClass} font-mono uppercase`} />
          </FormField>

          <FormField label="Previsão de entrega (opcional)" error={errors.estimated_delivery?.message}>
            <input {...register("estimated_delivery")} type="date" className={inputClass} />
          </FormField>

          {errorMessage && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border px-5 py-2.5 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isPending ? "Salvando..." : "Confirmar envio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}