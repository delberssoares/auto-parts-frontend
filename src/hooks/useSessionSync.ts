import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../services/authService";
import { useAuth } from "../store/authStore";

// Revalida o token ao abrir o app (pega expiração e mudança de papel)
// e descarta os dados da conta quando a sessão termina
export function useSessionSync() {
  const queryClient = useQueryClient();
  const token = useAuth((s) => s.token);
  const setUser = useAuth((s) => s.setUser);
  const previousToken = useRef(token);

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

  // Só quando uma sessão TERMINA (logout, 401 ou redefinição de senha).
  // Remove apenas o que é da conta: o catálogo público continua em cache.
  useEffect(() => {
    if (previousToken.current && !token) {
      queryClient.removeQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["order"] });
      queryClient.removeQueries({ queryKey: ["me"] });
    }
    previousToken.current = token;
  }, [token, queryClient]);
}