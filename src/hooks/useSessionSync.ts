import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../services/authService";
import { useAuth } from "../store/authStore";

// Revalida o token ao abrir o app (pega expiração e mudança de papel)
// e limpa o cache quando a sessão termina, para não vazar dados entre contas
export function useSessionSync() {
  const queryClient = useQueryClient();
  const token = useAuth((s) => s.token);
  const setUser = useAuth((s) => s.setUser);

  const { data } = useQuery({
    queryKey: ["me", token],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    if (!token) queryClient.clear();
  }, [token, queryClient]);
}