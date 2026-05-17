import Link from "next/link";
import { getOwnerProfile, listMatchesForProfile } from "@/lib/db";
import { can } from "@/lib/plans";
import { modalityLabel } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const owner = await getOwnerProfile();

  if (!can(owner.plan_id, "canUseAiMatchVisibility")) {
    return (
      <div className="card">
        <h1 className="text-xl font-bold">Входящие подборы</h1>
        <p className="mt-2 text-slate-600">
          Видимость в AI-подборе и входящие подборы доступны на тарифе Pro.
        </p>
        <Link href="/dashboard/billing" className="btn-primary mt-4">
          Подключить Pro
        </Link>
      </div>
    );
  }

  const matches = await listMatchesForProfile(owner.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Входящие подборы</h1>
      <p className="text-sm text-slate-600">
        Клиенты, которым AI-подбор предложил ваш профиль. Это не
        гарантированная заявка — у каждого результата есть и причины, и
        вопросы для уточнения.
      </p>

      {matches.length === 0 && (
        <p className="text-sm text-slate-500">Подборов пока нет.</p>
      )}

      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.id} className="card space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="badge bg-brand-100 text-brand-800">
                #{m.rank} · score {m.score}
              </span>
              <span className="text-slate-500">
                {new Date(m.created_at).toLocaleDateString("ru-RU")}
              </span>
              <span className="text-slate-700">
                Рекомендация: {m.service_recommendation}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Запрос:{" "}
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
            {m.reasons.length > 0 && (
              <p className="text-sm text-emerald-700">
                Почему подходит: {m.reasons.join("; ")}
              </p>
            )}
            {m.risks.length > 0 && (
              <p className="text-sm text-amber-700">
                Уточнить: {m.risks.join("; ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
