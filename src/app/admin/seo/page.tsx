import { getActivityTotals, listAllProfiles } from "@/lib/db";
import { computeQualityScore, isIndexable, QUALITY_INDEX_THRESHOLD } from "@/lib/quality";

const INDEXED = [
  "/",
  "/therapists",
  "/therapists/[service]",
  "/therapists/[service]/[city]",
  "/therapists/[city]",
  "/therapist/[slug] (только при quality ≥ 70)",
  "/pricing",
  "/examples",
];

const NOINDEX = [
  "/dashboard/*",
  "/admin/*",
  "/favorites",
  "/match/results",
  "/booking/[token]",
  "/therapist/[slug]/booking",
  "/dashboard/billing",
  "/dashboard/support",
  "/dashboard/bookings",
  "/dashboard/clients",
];

export default function AdminSeoPage() {
  const profiles = listAllProfiles();
  const totals = getActivityTotals();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">SEO и активность</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Просмотры профилей</p>
          <p className="text-xl font-semibold mt-1">{totals.totalViews}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Клики по контактам</p>
          <p className="text-xl font-semibold mt-1">{totals.totalClicks}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">AI-вызовы</p>
          <p className="text-xl font-semibold mt-1">{totals.aiCalls}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-emerald-700">Индексируется</h2>
          <ul className="mt-2 text-sm list-disc list-inside text-slate-600">
            {INDEXED.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold text-red-700">Noindex</h2>
          <ul className="mt-2 text-sm list-disc list-inside text-slate-600">
            {NOINDEX.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold">
          Индексация профилей (порог {QUALITY_INDEX_THRESHOLD})
        </h2>
        <table className="w-full text-sm mt-3">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">Профиль</th>
              <th className="py-2 pr-4">Качество</th>
              <th className="py-2 pr-4">Индексируется</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2 pr-4">{p.full_name}</td>
                <td className="py-2 pr-4">
                  {computeQualityScore(p).score}/100
                </td>
                <td className="py-2 pr-4">
                  {isIndexable(p) ? (
                    <span className="text-emerald-700">да</span>
                  ) : (
                    <span className="text-slate-400">нет</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
