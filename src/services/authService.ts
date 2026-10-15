import { sendEmail } from "./mailService";
import type { User } from "../types";

const USERS_KEY = "auto-parts-users";
const RESET_TOKENS_KEY = "auto-parts-reset-tokens";
const RESET_REQUESTS_KEY = "auto-parts-reset-requests";
const ADMIN_EMAIL = "admin@autoparts.com";

export const RESET_TOKEN_TTL_MIN = 30;
export const RESET_COOLDOWN_SEC = 60;

// Mesma mensagem para inválido, expirado e já usado: não ajuda quem está tentando adivinhar
const INVALID_LINK_MESSAGE = "Este link é inválido ou expirou. Solicite um novo.";

const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

interface StoredUser extends User {
  password_hash: string;
}

interface ResetToken {
  token_hash: string;
  email: string;
  created_at: string;
  expires_at: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export class RateLimitError extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super(`Aguarde ${retryAfter}s para solicitar um novo link.`);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/* ---------- Utilitários ---------- */

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Demo: não é segurança real, só evita guardar a senha em texto puro
const hashPassword = (email: string, password: string) => sha256(`${email}:${password}`);

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local[0]}${"*".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

/* ---------- Usuários ---------- */

function writeUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users);
}

// Garante que a conta admin da demo exista
async function readUsers(): Promise<StoredUser[]> {
  const stored = readJson<StoredUser[]>(USERS_KEY, []);
  let users = Array.isArray(stored) ? stored : [];

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

/* ---------- Recuperação de senha ---------- */

// Tokens expirados somem na leitura
function readTokens(): ResetToken[] {
  const stored = readJson<ResetToken[]>(RESET_TOKENS_KEY, []);
  const now = Date.now();
  return (Array.isArray(stored) ? stored : []).filter((t) => Date.parse(t.expires_at) > now);
}

async function findValidToken(token: string): Promise<ResetToken> {
  const hash = await sha256(token);
  const record = readTokens().find((t) => t.token_hash === hash);
  if (!record) throw new Error(INVALID_LINK_MESSAGE);
  return record;
}

// Não retorna nada de propósito: a resposta é a mesma exista ou não a conta
export async function requestPasswordReset(email: string): Promise<void> {
  await delay(900);

  const normalized = email.trim().toLowerCase();

  // Rate limit por e-mail, valendo também para contas inexistentes
  const requests = readJson<Record<string, string>>(RESET_REQUESTS_KEY, {});
  const last = requests[normalized];
  if (last) {
    const elapsed = (Date.now() - Date.parse(last)) / 1000;
    if (elapsed < RESET_COOLDOWN_SEC) {
      throw new RateLimitError(Math.ceil(RESET_COOLDOWN_SEC - elapsed));
    }
  }
  requests[normalized] = new Date().toISOString();
  writeJson(RESET_REQUESTS_KEY, requests);

  const users = await readUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return; // silêncio: nada de e-mail, nada de erro

  const token = randomToken();
  const now = Date.now();

  // Um único link ativo por conta: o novo invalida os anteriores
  const tokens = readTokens().filter((t) => t.email !== normalized);
  tokens.push({
    token_hash: await sha256(token), // só o hash é guardado, nunca o token
    email: normalized,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + RESET_TOKEN_TTL_MIN * 60 * 1000).toISOString(),
  });
  writeJson(RESET_TOKENS_KEY, tokens);

  sendEmail({
    to: normalized,
    subject: "Redefinição de senha - Auto Parts",
    body:
      `Olá, ${user.name}!\n\n` +
      `Recebemos um pedido para redefinir a senha da sua conta. ` +
      `O link abaixo vale por ${RESET_TOKEN_TTL_MIN} minutos e só pode ser usado uma vez.\n\n` +
      `Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.`,
    action: { label: "Redefinir senha", href: `/redefinir-senha?token=${token}` },
  });
}

// Usada pela página para checar o link antes de mostrar o formulário
export async function validateResetToken(token: string): Promise<{ email: string }> {
  await delay(400);
  const record = await findValidToken(token);
  return { email: maskEmail(record.email) };
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await delay(900);

  const record = await findValidToken(token);
  const users = await readUsers();
  const index = users.findIndex((u) => u.email === record.email);
  if (index === -1) throw new Error(INVALID_LINK_MESSAGE);

  users[index] = {
    ...users[index],
    password_hash: await hashPassword(record.email, newPassword),
  };
  writeUsers(users);

  // Consome o token (uso único) e qualquer outro link pendente da conta
  writeJson(
    RESET_TOKENS_KEY,
    readTokens().filter((t) => t.email !== record.email)
  );

  sendEmail({
    to: record.email,
    subject: "Sua senha foi alterada - Auto Parts",
    body:
      `Olá, ${users[index].name}!\n\n` +
      `A senha da sua conta foi alterada com sucesso. ` +
      `Se não foi você, redefina a senha novamente e entre em contato com o suporte.`,
  });
}