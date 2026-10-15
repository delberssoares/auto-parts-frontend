import { formatDate } from "../lib/format";
import { statusMeta } from "../lib/orderStatus";
import type { StatusEvent } from "../types";

const actors = { customer: "Cliente", admin: "Loja", system: "Sistema" } as const;

interface Props {
  history: StatusEvent[];
  showActor?: boolean;
}

export default function OrderTimeline({ history, showActor = false }: Props) {
  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {history.map((event, index) => {
        const isLast = index === history.length - 1;
        return (
          <li key={`${event.status}-${event.at}`} className="relative">
            <span
              className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                isLast ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
            <p className="text-sm font-semibold">{statusMeta[event.status].label}</p>
            <p className="text-xs text-slate-500">
              {formatDate(event.at)}
              {showActor && ` · ${actors[event.by]}`}
            </p>
            {event.note && <p className="mt-0.5 text-xs text-slate-500">{event.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}