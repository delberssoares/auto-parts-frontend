import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import FormField from "../components/FormField";
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
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(schema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: LoginData) => login(email, password),
    onSuccess: (loggedUser) => {
      setUser(loggedUser);
      navigate(from, { replace: true });
    },
  });

  if (user) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
      <p className="mb-6 text-sm text-slate-500">
        Demo: use qualquer e-mail válido e a senha <strong>123456</strong>.
      </p>
      <p className="mb-6 text-sm text-slate-500">
        Demo: use qualquer e-mail válido e a senha <strong>123456</strong>.
        <br />
        Admin: <strong>admin@autoparts.com</strong> / <strong>123456</strong>.
      </p>



      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
        <FormField label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
        </FormField>
        <FormField label="Senha" error={errors.password?.message}>
          <input {...register("password")} type="password" autoComplete="current-password" className={inputClass} />
        </FormField>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{(error as Error).message}</p>
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