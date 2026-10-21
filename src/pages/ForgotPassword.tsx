import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "../components/FormField";
import { useCountdown } from "../hooks/useCountdown";
import { useForgotPassword } from "../hooks/usePasswordReset";
import { ApiError } from "../lib/api";
import { RESET_COOLDOWN_SEC, RESET_TOKEN_TTL_MIN } from "../services/authService";

const schema = z.object({ email: z.string().trim().email("Informe um e-mail válido") });
type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [remaining, setRemaining] = useCountdown();
  const { mutate, isPending, error } = useForgotPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  function send(email: string) {
    mutate(email, {
      onSuccess: (data) => {
        // Conta de demonstração: não há e-mail, vai direto para criar a nova senha
        if (data.demo_reset_token) {
          navigate(`/redefinir-senha?token=${encodeURIComponent(data.demo_reset_token)}`, {
            state: { demo: true },
          });
          return;
        }
        setSentTo(email);
        setRemaining(RESET_COOLDOWN_SEC);
      },
      onError: (e) => {
        if (e instanceof ApiError && e.status === 429 && e.retryAfter) setRemaining(e.retryAfter);
      },
    });
  }

  const errorBox = error && (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {(error as Error).message}
    </p>
  );

  if (sentTo) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border bg-white p-8">
        <div role="status" aria-live="polite" className="text-center">
          <div className="text-4xl">📧</div>
          <h1 className="mt-2 text-2xl font-bold">Verifique seu e-mail</h1>
          <p className="mt-3 text-sm text-slate-600">
            Se existir uma conta para <strong>{sentTo}</strong>, enviamos um link para redefinir a
            senha. Ele vale por {RESET_TOKEN_TTL_MIN} minutos e só pode ser usado uma vez.
          </p>
          <p className="mt-2 text-sm text-slate-500">Não chegou? Confira também a caixa de spam.</p>
        </div>

        {errorBox}

        <button
          onClick={() => send(sentTo)}
          disabled={isPending || remaining > 0}
          className="w-full rounded-lg border px-6 py-3 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Reenviando..." : remaining > 0 ? `Reenviar link em ${remaining}s` : "Reenviar link"}
        </button>


        <p className="text-center text-sm">
          <Link to="/login" className="text-blue-700 underline">Voltar para o login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-1 text-2xl font-bold">Esqueceu a senha?</h1>
      <p className="mb-6 text-sm text-slate-500">
        Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
      </p>

      <form onSubmit={handleSubmit((d) => send(d.email))} noValidate className="space-y-4">
        <FormField label="E-mail" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            autoFocus
            className={inputClass}
          />
        </FormField>

        {errorBox}

        <button
          type="submit"
          disabled={isPending || remaining > 0}
          className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Enviando..." : remaining > 0 ? `Aguarde ${remaining}s` : "Enviar link de redefinição"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-blue-700 underline">Voltar para o login</Link>
      </p>
    </div>
  );
}