import Link from "next/link";
import { getOwnerProfile, listClients } from "@/lib/db";
import { modalityLabel } from "@/lib/catalog";

export default async function ClientsPage() {
  const owner = await getOwnerProfile();
  const clients = await listClients(owner.id);

  const totalSessions = clients.reduce(
    (sum, c) => sum + (c.sessions ?? []).length,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">База · {clients.length} клиентов</p>
          <h1 className="h1 mt-3">Клиенты (CRM)</h1>
          <p className="small mt-3 max-w-xl">
            Клиент создаётся из завершённой заявки кнопкой «Преобразовать в
            клиента». Храните минимум чувствительных данных — без диагнозов.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-4 text-center">
            <p className="eyebrow text-secondary">Клиентов</p>
            <p className="num-label text-3xl mt-1">{clients.length}</p>
          </div>
          <div className="card px-5 py-4 text-center bg-accent-soft border-accent">
            <p className="eyebrow text-secondary">Сеансов</p>
            <p className="num-label text-3xl mt-1 text-accent">
              {totalSessions}
            </p>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="card-interactive block"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="serif text-lg text-heading">{c.name}</p>
              <span className="badge bg-plum-700 text-white">
                {c.repeat_status}
              </span>
            </div>
            <p className="text-sm text-secondary mt-1">
              {[c.city, c.district].filter(Boolean).join(", ") || "—"}
            </p>
            <hr className="rule my-3" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-body">
                {c.preferred_service_type
                  ? modalityLabel(c.preferred_service_type)
                  : "—"}
              </span>
              <span className="flex items-baseline gap-1">
                <span className="num-label text-xl">
                  {(c.sessions ?? []).length}
                </span>
                <span className="text-secondary text-xs">сеансов</span>
              </span>
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <p className="text-sm text-secondary">Клиентов пока нет.</p>
        )}
      </div>
    </div>
  );
}
