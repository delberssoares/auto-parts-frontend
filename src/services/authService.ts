import type { User } from "../types";

const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

const ADMIN_EMAIL = "admin@autoparts.com";

// Demo: qualquer e-mail válido, senha "123456". O e-mail admin recebe o papel de administrador.
export async function login(email: string, password: string): Promise<User> {
  await delay();
  if (password !== "123456") throw new Error("E-mail ou senha inválidos");

  const normalized = email.trim().toLowerCase();
  const name = normalized.split("@")[0];

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: normalized,
    role: normalized === ADMIN_EMAIL ? "admin" : "customer",
  };
}