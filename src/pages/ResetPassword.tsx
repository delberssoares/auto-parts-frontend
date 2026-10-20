import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";
import { useResetPassword, useResetTokenCheck } from "../hooks/usePasswordReset";
import { passwordSchema } from "../lib/passwordSchema";
import { useAuth } from "../store/authStore";

const schema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

function InvalidLink() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border bg-white p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-2xl font-bold">Link inválido ou expirado</h1>
      <p className="text-sm text-slate-600">
        Por segurança, os links de redefinição expiram e só podem ser usados uma vez.
      </p>
      <Link
        to="/esqueci-senha"
        className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
      >
        Solicitar novo link
      </Link>
    </div>
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);

  const check = useResetTokenCheck(token);
  const { mutate, isPending, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  if (!token || check.isError) return <InvalidLink />;
  if (check.isLoading) return <div className="mx-auto h-64 max-w-md animate-pulse rounded-xl bg-slate-200" />;

  function onSubmit({ password }: FormData) {
    mutate(
      { token: token!, password },
      {
        onSuccess: () => {
          logout(); // encerra qualquer sessão aberta neste navegador
          navigate("/login", {
            replace: true,
            state: { notice: "Senha alterada com sucesso. Entre com a nova senha." },
          });
        },
      }
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-1 text-2xl font-bold">Criar nova senha</h1>
      <p className="mb-6 text-sm text-slate-500">
        Conta: <strong>{check.data?.email}</strong>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Nova senha" error={errors.password?.message}>
          <PasswordInput {...register("password")} autoComplete="new-password" autoFocus />
        </FormField>
        <PasswordStrength value={watch("password")} />

        <FormField label="Confirmar nova senha" error={errors.confirm?.message}>
          <PasswordInput {...register("confirm")} autoComplete="new-password" />
        </FormField>

        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p>{(error as Error).message}</p>
            <Link to="/esqueci-senha" className="mt-1 inline-block font-medium underline">
              Solicitar novo link
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}