import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import FormField from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import { login } from "../services/authService";
import { useAuth } from "../store/authStore";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});
type LoginData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; notice?: string } | null;
  const from = state?.from ?? "/";

  const user = useAuth((s) => s.user);
  const setSession = useAuth((s) => s.setSession);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(schema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: LoginData) => login(email, password),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      navigate(from, { replace: true });
    },
  });

  if (user) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
      <p className="mb-6 text-sm text-slate-500">
        Não tem conta?{" "}
        <Link to="/cadastro" state={state} className="text-blue-700 underline">
          Criar conta
        </Link>
        <br />
      </p>

      {state?.notice && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {state.notice}
        </p>
      )}

      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
        <FormField label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
        </FormField>

        <FormField label="Senha" error={errors.password?.message}>
          <PasswordInput {...register("password")} autoComplete="current-password" />
        </FormField>

        <div className="-mt-2 text-right text-sm">
          <Link to="/esqueci-senha" className="text-blue-700 hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {(error as Error).message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}