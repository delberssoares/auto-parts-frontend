export interface MockEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  action?: { label: string; href: string };
  sent_at: string;
}

const OUTBOX_KEY = "auto-parts-outbox";
const MAX_EMAILS = 20;

export function getOutbox(): MockEmail[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Em produção isto seria um provedor (SES, Resend, SendGrid...) chamado pelo backend
export function sendEmail(email: Omit<MockEmail, "id" | "sent_at">) {
  const message: MockEmail = {
    ...email,
    id: crypto.randomUUID(),
    sent_at: new Date().toISOString(),
  };
  localStorage.setItem(OUTBOX_KEY, JSON.stringify([message, ...getOutbox()].slice(0, MAX_EMAILS)));
}

export function clearOutbox() {
  localStorage.removeItem(OUTBOX_KEY);
}