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
      <div className="card bg-gradient-to-br from-accent to-plum-700 border-line-strong max-w-xl">
        <p className="eyebrow text-white/65">Аналитика</p>
        <h1 className="h2 mt-2 text-white">Доступно на тарифе Pro</h1>
        <p className="mt-3 text-white/80">
          Аналитика доступна на тарифе Pro.
        </p>
        <Link href="/dashboard/billing" className="btn-secondary mt-6">
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

  const funnelMax = Math.max(1, bookings.length);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Кабинет · показатели</p>
        <h1 className="h1 mt-3">Аналитика</h1>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Просмотры профиля" value={String(a.totalViews)} highlight />
        <Stat label="Клики по контактам" value={String(a.totalClicks)} />
        <Stat label="Всего заявок" value={String(bookings.length)} />
        <Stat label="Конверсия в клиента" value={`${conv}%`} />
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="h2">Просмотры профиля</h2>
          <span className="small">14 дней</span>
        </div>
        <div className="card">
          <div className="eyebrow mb-6">Просмотры по дням</div>
          <div className="flex items-end gap-2 sm:gap-3 h-44">
            {a.viewsByDay.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                title={`${d.date}: ${d.count}`}
              >
                <span className="font-serif text-xs text-heading">
                  {d.count > 0 ? d.count : ""}
                </span>
                <div
                  className="w-full bg-surface rounded-md overflow-hidden flex items-end"
                  style={{ height: "100%", minHeight: 4 }}
                >
                  <div
                    className="w-full bg-gradient-to-br from-accent to-plum-700 rounded-md"
                    style={{
                      height: `${Math.max((d.count / maxDay) * 100, d.count > 0 ? 6 : 2)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <hr className="rule my-5" />
          <p className="small">
            {a.viewsByDay[0]?.date} — {a.viewsByDay.at(-1)?.date}
          </p>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-6">
        <section>
          <h2 className="h3 mb-4">Клики по контактам</h2>
          <div className="card">
            {a.totalClicks === 0 ? (
              <p className="small">Кликов пока нет.</p>
            ) : (
              <ul className="space-y-4">
                {Object.entries(a.clicksByChannel).map(([ch, n]) => {
                  const pct = Math.round((n / Math.max(1, a.totalClicks)) * 100);
                  return (
                    <li key={ch}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-body text-sm">{ch}</span>
                        <span className="small">
                          {n} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="h3 mb-4">Воронка</h2>
          <div className="card space-y-4">
            <FunnelRow
              label="Заявки"
              value={bookings.length}
              max={funnelMax}
            />
            <FunnelRow
              label="Подтверждено"
              value={confirmed}
              max={funnelMax}
            />
            <FunnelRow label="Завершено" value={completed} max={funnelMax} />
            <FunnelRow
              label="Стали клиентами"
              value={converted}
              max={funnelMax}
            />
          </div>
        </section>
      </div>

      <p className="small">
        Качество профиля: {computeQualityScore(owner).score}/100
      </p>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div className="border-t border-line pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-body text-sm">{label}</span>
        <span className="num-label text-heading">{value}</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-br from-accent to-plum-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "card bg-accent-soft border-line-strong" : "card"}>
      <p className="eyebrow">{label}</p>
      <p
        className={`num-label mt-2 ${
          highlight ? "text-accent" : "text-heading"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
