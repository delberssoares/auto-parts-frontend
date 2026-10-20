import { useAuth } from "../store/authStore";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  retryAfter?: number;
  errors?: { field: string; message: string }[];

  constructor(
    status: number,
    message: string,
    details: { retryAfter?: number; errors?: ApiError["errors"] } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = details.retryAfter;
    this.errors = details.errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // envia o token (padrão: sim)
  signal?: AbortSignal;
}

export async function api<T>(
  path: string,
  { method = "GET", body, auth = true, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = useAuth.getState().token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Tente novamente em instantes.");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Token expirado ou inválido: encerra a sessão local
    if (response.status === 401 && auth && token) useAuth.getState().logout();

    throw new ApiError(
      response.status,
      typeof data?.detail === "string" ? data.detail : "Algo deu errado. Tente novamente.",
      { retryAfter: data?.retry_after, errors: data?.errors }
    );
  }

  return data as T;
}