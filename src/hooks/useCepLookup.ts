import { useCallback, useEffect, useRef, useState } from "react";
import { CepNotFoundError, lookupCep, type Address } from "../services/cepService";

export type CepStatus = "idle" | "loading" | "found" | "notfound" | "error";

export function useCepLookup() {
  const [status, setStatus] = useState<CepStatus>("idle");
  const controller = useRef<AbortController | null>(null);

  const lookup = useCallback(async (cep: string): Promise<Address | null> => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;

    setStatus("loading");
    try {
      const address = await lookupCep(cep, current.signal);
      if (current.signal.aborted) return null;
      setStatus("found");
      return address;
    } catch (error) {
      if (current.signal.aborted) return null;
      setStatus(error instanceof CepNotFoundError ? "notfound" : "error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setStatus("idle");
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { status, lookup, reset };
}