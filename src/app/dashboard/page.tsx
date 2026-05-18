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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Добрый день, {profile.full_name}
      </h1>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Тариф" value={plan.title} />
        <Stat label="Качество профиля" value={`${q.score}/100`} />
        <Stat label="Новые заявки" value={String(newBookings)} />
        <Stat label="Клиентов в CRM" value={String(clients.length)} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Качество профиля</h2>
          <span className="text-sm text-slate-500">
            Порог индексации: {QUALITY_INDEX_THRESHOLD}
          </span>
        </div>
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500"
            style={{ width: `${q.score}%` }}
          />
        </div>
        <ul className="mt-3 grid sm:grid-cols-2 gap-1 text-sm">
          {q.parts.map((p) => (
            <li
              key={p.key}
              className={p.ok ? "text-emerald-700" : "text-slate-400"}
            >
              {p.ok ? "✓" : "○"} {p.label}
            </li>
          ))}
        </ul>
        {q.score < QUALITY_INDEX_THRESHOLD && (
          <p className="mt-3 text-sm text-amber-700">
            Профиль ещё не индексируется в поиске. Заполните недостающие блоки.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/profile" className="card hover:ring-1 hover:ring-brand-300">
          <p className="font-medium">Заполнить профиль</p>
          <p className="text-sm text-slate-500">Услуги, цены, формат работы</p>
        </Link>
        <Link href="/dashboard/media" className="card hover:ring-1 hover:ring-brand-300">
          <p className="font-medium">Загрузить медиа</p>
          <p className="text-sm text-slate-500">Фото, видео, сертификаты</p>
        </Link>
        <Link href="/dashboard/bookings" className="card hover:ring-1 hover:ring-brand-300">
          <p className="font-medium">Заявки</p>
          <p className="text-sm text-slate-500">{newBookings} новых</p>
        </Link>
      </div>

      {sub && (
        <p className="text-sm text-slate-500">
          Подписка: {sub.status}
          {sub.expires_at
            ? `, активна до ${new Date(sub.expires_at).toLocaleDateString("ru-RU")}`
            : ""}
        </p>
      )}
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
