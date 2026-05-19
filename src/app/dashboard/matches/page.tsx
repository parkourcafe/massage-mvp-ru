import Link from "next/link";
import { getOwnerProfile, listMatchesForProfile } from "@/lib/db";
import { can } from "@/lib/plans";
import { modalityLabel } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const owner = await getOwnerProfile();

  if (!can(owner.plan_id, "canUseAiMatchVisibility")) {
    return (
      <div className="card bg-gradient-to-br from-accent to-plum-700 border-line-strong max-w-xl">
        <p className="eyebrow text-white/65">AI-подбор</p>
        <h1 className="h2 mt-2 text-white">Входящие подборы</h1>
        <p className="mt-3 text-white/80">
          Видимость в AI-подборе и входящие подборы доступны на тарифе Pro.
        </p>
        <Link href="/dashboard/billing" className="btn-secondary mt-6">
          Подключить Pro
        </Link>
      </div>
    );
  }

  const matches = await listMatchesForProfile(owner.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Кабинет · AI-подбор</p>
        <h1 className="h1 mt-3">Входящие подборы</h1>
        <p className="mt-3 text-body body-lg">
          Клиенты, которым AI-подбор предложил ваш профиль. Это не
          гарантированная заявка — у каждого результата есть и причины, и
          вопросы для уточнения.
        </p>
      </div>

      {matches.length === 0 && (
        <div className="card">
          <p className="small">Подборов пока нет.</p>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((m) => (
          <div key={m.id} className="card space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="num-label text-accent">#{m.rank}</span>
              <span className="chip-brand">score {m.score}</span>
              <span className="text-secondary">
                {new Date(m.created_at).toLocaleDateString("ru-RU")}
              </span>
              <span className="ml-auto text-heading">
                Рекомендация: {m.service_recommendation}
              </span>
            </div>
            <hr className="rule" />
            <div className="rounded-lg bg-surface px-4 py-3">
              <p className="eyebrow text-secondary mb-1.5">Запрос</p>
              <p className="text-sm text-body">
                {m.request?.massage_goal ||
                  m.request?.pain_or_focus_area ||
                  "цель не указана"}
                {m.request?.preferred_service_type
                  ? ` · ${modalityLabel(m.request.preferred_service_type)}`
                  : ""}
                {m.request?.city ? ` · ${m.request.city}` : ""}
                {m.request?.district ? `, ${m.request.district}` : ""}
                {m.request?.budget ? ` · бюджет ${m.request.budget} ₽` : ""}
              </p>
            </div>
            {m.reasons.length > 0 && (
              <p className="text-sm text-accent">
                Почему подходит: {m.reasons.join("; ")}
              </p>
            )}
            {m.risks.length > 0 && (
              <p className="rounded-lg bg-accent-soft border border-line text-mag-300 text-sm px-4 py-3">
                Уточнить: {m.risks.join("; ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
