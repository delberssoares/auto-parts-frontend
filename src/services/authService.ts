import { api } from "../lib/api";
import type { User } from "../types";

// Devem refletir RESET_TOKEN_TTL_MINUTES e RESET_COOLDOWN_SECONDS do backend
export const RESET_TOKEN_TTL_MIN = 30;
export const RESET_COOLDOWN_SEC = 60;

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Session {
  token: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
  demo_reset_token?: string; // só vem em contas de demonstração
}

const toSession = (data: TokenResponse): Session => ({ token: data.access_token, user: data.user });

export async function register(input: RegisterInput): Promise<Session> {
  return toSession(await api<TokenResponse>("/auth/register", { method: "POST", body: input, auth: false }));
}

export async function login(email: string, password: string): Promise<Session> {
  return toSession(
    await api<TokenResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false })
  );
}

export const getMe = () => api<User>("/auth/me");

export const changePassword = (current_password: string, new_password: string) =>
  api<void>("/auth/change-password", { method: "POST", body: { current_password, new_password } });

export const requestPasswordReset = (email: string) =>
  api<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });

export const validateResetToken = (token: string) =>
  api<{ email: string }>("/auth/reset-password/validate", { method: "POST", body: { token }, auth: false });

export const resetPassword = (token: string, password: string) =>
  api<void>("/auth/reset-password", { method: "POST", body: { token, password }, auth: false });