import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import FormField from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";
import { passwordSchema } from "../lib/passwordSchema";
import { changePassword } from "../services/authService";
import { useAuth } from "../store/authStore";

const schema = z
  .object({
    current_password: z.string().min(1, "Informe a senha atual"),
    new_password: passwordSchema,
    confirm: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function Account() {
  const user = useAuth((s) => s.user);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "", confirm: "" },
  });

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (d: FormData) => changePassword(d.current_password, d.new_password),
    onSuccess: () => reset(),
  });

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p className="text-sm text-slate-500">{user?.name} · {user?.email}</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Alterar senha</h2>

        <FormField label="Senha atual" error={errors.current_password?.message}>
          <PasswordInput {...register("current_password")} autoComplete="current-password" />
        </FormField>

        <FormField label="Nova senha" error={errors.new_password?.message}>
          <PasswordInput {...register("new_password")} autoComplete="new-password" />
        </FormField>
        <PasswordStrength value={watch("new_password")} />

        <FormField label="Confirmar nova senha" error={errors.confirm?.message}>
          <PasswordInput {...register("confirm")} autoComplete="new-password" />
        </FormField>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {(error as Error).message}
          </p>
        )}
        {isSuccess && (
          <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Senha alterada com sucesso.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </section>
  );
}