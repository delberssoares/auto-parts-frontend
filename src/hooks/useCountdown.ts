import { useEffect, useState } from "react";

// Contagem regressiva em segundos: [restante, iniciar]
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return [remaining, setRemaining] as const;
}