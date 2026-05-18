import Link from "next/link";
import {
  getOwnerProfile,
  getSubscription,
  listBookingsForProfile,
  listClients,
} from "@/lib/db";
import { computeQualityScore, QUALITY_INDEX_THRESHOLD } from "@/lib/quality";
import { planFor } from "@/lib/plans";

export default async function DashboardHome() {
  const profile = await getOwnerProfile();
  const bookings = await listBookingsForProfile(profile.id);
  const clients = await listClients(profile.id);
  const q = computeQualityScore(profile);
  const sub = await getSubscription(profile.id);
  const plan = planFor(profile.plan_id);

  const newBookings = bookings.filter((b) =>
    ["new", "chat_started", "waiting_therapist_reply"].includes(b.status)
  ).length;

  return (
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Кабинет мастера</p>
        <h1 className="h1 mt-3">
          Добрый день,{" "}
          <span className="italic text-accent">{profile.full_name}</span>
        </h1>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Тариф" value={plan.title} />
        <Stat label="Качество профиля" value={`${q.score}/100`} highlight />
        <Stat
          label="Новые заявки"
          value={String(newBookings)}
          sub="ждут ответа"
          urgent={newBookings > 0}
        />
        <Stat
          label="Клиентов в CRM"
          value={String(clients.length)}
          sub="в базе"
        />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="h2">Качество профиля</h2>
            <span className="small">
              Порог индексации: {QUALITY_INDEX_THRESHOLD}
            </span>
          </div>
          <div className="card">
            <div className="flex items-baseline justify-between mb-4">
              <span className="eyebrow">Заполненность</span>
              <span className="num-label text-heading">{q.score}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-br from-accent to-plum-700"
                style={{ width: `${q.score}%` }}
              />
            </div>
            <hr className="rule my-5" />
            <ul className="grid sm:grid-cols-2 gap-2.5 text-sm">
              {q.parts.map((p) => (
                <li
                  key={p.key}
                  className={`flex items-center gap-2 ${
                    p.ok ? "text-body" : "text-secondary"
                  }`}
                >
                  <span
                    className={
                      p.ok ? "text-accent font-serif" : "text-secondary"
                    }
                  >
                    {p.ok ? "✓" : "○"}
                  </span>
                  {p.label}
                </li>
              ))}
            </ul>
            {q.score < QUALITY_INDEX_THRESHOLD && (
              <p className="mt-5 rounded-lg bg-accent-soft border border-line text-accent text-sm px-4 py-3">
                Профиль ещё не индексируется в поиске. Заполните недостающие
                блоки.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="h2 mb-5">Что дальше</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/profile"
              className="card-interactive block"
            >
              <p className="font-medium text-heading">Заполнить профиль</p>
              <p className="small mt-1">Услуги, цены, формат работы</p>
            </Link>
            <Link
              href="/dashboard/media"
              className="card-interactive block"
            >
              <p className="font-medium text-heading">Загрузить медиа</p>
              <p className="small mt-1">Фото, видео, сертификаты</p>
            </Link>
            <Link
              href="/dashboard/bookings"
              className="card-interactive block"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-heading">Заявки</p>
                <span className="chip">{newBookings}</span>
              </div>
              <p className="small mt-1">{newBookings} новых</p>
            </Link>
          </div>
        </section>
      </div>

      {sub && (
        <div className="card bg-gradient-to-br from-accent to-plum-700 border-line-strong">
          <p className="eyebrow text-white/65">Подписка</p>
          <p className="serif text-white text-lg mt-2">
            {sub.status}
            {sub.expires_at
              ? ` · активна до ${new Date(
                  sub.expires_at
                ).toLocaleDateString("ru-RU")}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight = false,
  urgent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={`card relative ${
        highlight
          ? "bg-accent-soft border-line-strong"
          : urgent
            ? "border-line-strong"
            : ""
      }`}
    >
      {urgent && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent" />
      )}
      <p className="eyebrow text-secondary">{label}</p>
      <p
        className={`num-label mt-2 ${
          highlight ? "text-accent" : "text-heading"
        }`}
      >
        {value}
      </p>
      {sub && <p className="small mt-1">{sub}</p>}
    </div>
  );
}
