import Link from "next/link";
import { getOwnerProfile, listClients } from "@/lib/db";
import { modalityLabel } from "@/lib/catalog";

export default async function ClientsPage() {
  const owner = await getOwnerProfile();
  const clients = await listClients(owner.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Клиенты (CRM)</h1>
      <p className="text-sm text-slate-600">
        Клиент создаётся из завершённой заявки кнопкой «Преобразовать в
        клиента». Храните минимум чувствительных данных — без диагнозов.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="card hover:ring-1 hover:ring-brand-300"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              <span className="badge bg-slate-100 text-slate-700">
                {c.repeat_status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {[c.city, c.district].filter(Boolean).join(", ")}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {c.preferred_service_type
                ? modalityLabel(c.preferred_service_type)
                : "—"}{" "}
              · сеансов: {(c.sessions ?? []).length}
            </p>
          </Link>
        ))}
        {clients.length === 0 && (
          <p className="text-sm text-slate-500">Клиентов пока нет.</p>
        )}
      </div>
    </div>
  );
}
