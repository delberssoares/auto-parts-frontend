import type { User } from "../types";

const USERS_KEY = "auto-parts-users";
const ADMIN_EMAIL = "admin@autoparts.com";
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

interface StoredUser extends User {
  password_hash: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

// Demo: não é segurança real, só evita guardar a senha em texto puro
async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email}:${password}`);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Garante que a conta admin da demo exista
async function readUsers(): Promise<StoredUser[]> {
  let users: StoredUser[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    if (Array.isArray(parsed)) users = parsed;
  } catch {
    // dados corrompidos: recomeça
  }

  if (!users.some((u) => u.email === ADMIN_EMAIL)) {
    users = [
      {
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        password_hash: await hashPassword(ADMIN_EMAIL, "123456"),
      },
      ...users,
    ];
    writeUsers(users);
  }
  return users;
}

// Nunca devolve o hash para o resto do app
const toPublicUser = ({ name, email, role }: StoredUser): User => ({ name, email, role });

export async function register({ name, email, password }: RegisterInput): Promise<User> {
  await delay();

  const normalized = email.trim().toLowerCase();
  const users = await readUsers();

  if (users.some((u) => u.email === normalized)) {
    throw new Error("Já existe uma conta com este e-mail.");
  }

  const user: StoredUser = {
    name: name.trim(),
    email: normalized,
    role: "customer",
    password_hash: await hashPassword(normalized, password),
  };
  writeUsers([...users, user]);
  return toPublicUser(user);
}

export async function login(email: string, password: string): Promise<User> {
  await delay();

  const normalized = email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((u) => u.email === normalized);

  // Mensagem genérica de propósito: não revela se o e-mail existe
  if (!user || user.password_hash !== (await hashPassword(normalized, password))) {
    throw new Error("E-mail ou senha inválidos");
  }
  return toPublicUser(user);
}