import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import FormField from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";
import { passwordSchema } from "../lib/passwordSchema";
import { register as registerUser } from "../services/authService";
import { useAuth } from "../store/authStore";

const schema = z
  .object({
    name: z.string().trim().min(3, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    password: passwordSchema,
    confirm: z.string().min(1, "Confirme a senha"),
    terms: z.boolean().refine((v) => v, "É preciso aceitar os termos para continuar"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type RegisterData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "", terms: false },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ name, email, password }: RegisterData) =>
      registerUser({ name, email, password }),
    onSuccess: (created) => {
      setUser(created); // já entra logado
      navigate(from, { replace: true });
    },
  });

  if (user) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8">
      <h1 className="mb-1 text-2xl font-bold">Criar conta</h1>
      <p className="mb-6 text-sm text-slate-500">
        Já tem conta?{" "}
        <Link to="/login" state={location.state} className="text-blue-700 underline">
          Entrar
        </Link>
      </p>

      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
        <FormField label="Nome completo" error={errors.name?.message}>
          <input {...register("name")} autoComplete="name" className={inputClass} />
        </FormField>

        <FormField label="E-mail" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
        </FormField>

        <FormField label="Senha" error={errors.password?.message}>
          <PasswordInput {...register("password")} autoComplete="new-password" />
        </FormField>
        <PasswordStrength value={watch("password")} />

        <FormField label="Confirmar senha" error={errors.confirm?.message}>
          <PasswordInput {...register("confirm")} autoComplete="new-password" />
        </FormField>

        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" {...register("terms")} className="mt-1" />
            <span>Li e aceito os termos de uso e a política de privacidade (demonstração).</span>
          </label>
          {errors.terms && (
            <span className="mt-1 block text-sm text-red-600">{errors.terms.message}</span>
          )}
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
          {isPending ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}