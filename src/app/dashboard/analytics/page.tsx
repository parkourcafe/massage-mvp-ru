import Link from "next/link";
import {
  getAnalytics,
  getOwnerProfile,
  listBookingsForProfile,
  listClients,
} from "@/lib/db";
import { can } from "@/lib/plans";
import { computeQualityScore } from "@/lib/quality";

export default async function AnalyticsPage() {
  const owner = await getOwnerProfile();
  if (!can(owner.plan_id, "canUseAnalytics")) {
    return (
      <div className="card">
        <h1 className="text-xl font-bold">Аналитика</h1>
        <p className="mt-2 text-slate-600">
          Аналитика доступна на тарифе Pro.
        </p>
        <Link href="/dashboard/billing" className="btn-primary mt-4">
          Подключить Pro
        </Link>
      </div>
    );
  }

  const a = await getAnalytics(owner.id);
  const maxDay = Math.max(1, ...a.viewsByDay.map((d) => d.count));
  const bookings = await listBookingsForProfile(owner.id);
  const clients = await listClients(owner.id);
  const completed = bookings.filter((b) => b.status === "completed").length;
  const converted = clients.length;
  const conv =
    bookings.length > 0
      ? Math.round((converted / bookings.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Аналитика</h1>
      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Просмотры профиля" value={String(a.totalViews)} />
        <Stat label="Клики по контактам" value={String(a.totalClicks)} />
        <Stat label="Всего заявок" value={String(bookings.length)} />
        <Stat label="Конверсия в клиента" value={`${conv}%`} />
      </div>

      <div className="card">
        <h2 className="font-semibold">Просмотры профиля (14 дней)</h2>
        <div className="mt-3 flex items-end gap-1 h-28">
          {a.viewsByDay.map((d) => (
            <div
              key={d.date}
              className="flex-1 bg-brand-200 rounded-t"
              style={{ height: `${(d.count / maxDay) * 100}%` }}
              title={`${d.date}: ${d.count}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {a.viewsByDay[0]?.date} — {a.viewsByDay.at(-1)?.date}
        </p>
      </div>

      <div className="card">
        <h2 className="font-semibold">Клики по контактам</h2>
        {a.totalClicks === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Кликов пока нет.</p>
        ) : (
          <ul className="mt-2 text-sm text-slate-600 space-y-1">
            {Object.entries(a.clicksByChannel).map(([ch, n]) => (
              <li key={ch}>
                {ch} → {n}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2 className="font-semibold">Воронка</h2>
        <ul className="mt-2 text-sm text-slate-600 space-y-1">
          <li>Заявки → {bookings.length}</li>
          <li>
            Подтверждено →{" "}
            {bookings.filter((b) => b.status === "confirmed").length}
          </li>
          <li>Завершено → {completed}</li>
          <li>Стали клиентами → {converted}</li>
        </ul>
      </div>
      <p className="text-sm text-slate-500">
        Качество профиля: {computeQualityScore(owner).score}/100
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
