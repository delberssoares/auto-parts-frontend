import { useMutation, useQuery } from "@tanstack/react-query";
import { requestPasswordReset, resetPassword, validateResetToken } from "../services/authService";

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => requestPasswordReset(email) });
}

export function useResetTokenCheck(token: string | null) {
  return useQuery({
    queryKey: ["reset-token", token],
    queryFn: () => validateResetToken(token!),
    enabled: !!token,
    retry: false, // link inválido não melhora tentando de novo
    staleTime: Infinity,
    gcTime: 0,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  });
}