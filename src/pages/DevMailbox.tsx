import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { DEMO_MODE } from "../lib/env";
import { formatDate } from "../lib/format";
import { clearOutbox, getOutbox } from "../services/mailService";

export default function DevMailbox() {
  const [emails, setEmails] = useState(getOutbox);

  if (!DEMO_MODE) return <Navigate to="/" replace />;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Caixa de e-mail simulada</h1>
        <div className="flex gap-2 text-sm font-medium">
          <button onClick={() => setEmails(getOutbox())} className="rounded-lg border px-4 py-2 hover:bg-slate-50">
            Atualizar
          </button>
          <button
            onClick={() => {
              clearOutbox();
              setEmails([]);
            }}
            className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Limpar
          </button>
        </div>
      </div>

      <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Ambiente de demonstração: nenhum e-mail real é enviado. Aqui aparecem as mensagens que o
        sistema enviaria aos clientes.
      </p>

      {emails.length === 0 && <p className="py-12 text-center text-slate-500">Nenhum e-mail enviado ainda.</p>}

      <ul className="space-y-4">
        {emails.map((email) => (
          <li key={email.id} className="rounded-xl border bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <p className="text-slate-500">
                Para: <strong className="text-slate-800">{email.to}</strong>
              </p>
              <p className="text-slate-400">{formatDate(email.sent_at)}</p>
            </div>
            <h2 className="mt-2 font-semibold">{email.subject}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{email.body}</p>
            {email.action && (
              <Link
                to={email.action.href}
                className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                {email.action.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}