import { listAllProfiles, listSubscriptions } from "@/lib/db";

export default function AdminSubscriptionsPage() {
  const subs = listSubscriptions();
  const profiles = listAllProfiles();
  const name = (id: string) =>
    profiles.find((p) => p.id === id)?.full_name ?? id;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Подписки</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">Профиль</th>
              <th className="py-2 pr-4">Тариф</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2 pr-4">Действует до</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="py-2 pr-4">{name(s.profile_id)}</td>
                <td className="py-2 pr-4">{s.plan_id}</td>
                <td className="py-2 pr-4">{s.status}</td>
                <td className="py-2 pr-4">
                  {s.expires_at
                    ? new Date(s.expires_at).toLocaleDateString("ru-RU")
                    : "—"}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  Подписок пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
