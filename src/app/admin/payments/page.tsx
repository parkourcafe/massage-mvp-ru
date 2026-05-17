import { listAllProfiles, listPayments } from "@/lib/db";
import { formatRub } from "@/lib/util";

export default function AdminPaymentsPage() {
  const payments = listPayments();
  const profiles = listAllProfiles();
  const name = (id: string) =>
    profiles.find((p) => p.id === id)?.full_name ?? id;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Платежи</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">Профиль</th>
              <th className="py-2 pr-4">Провайдер</th>
              <th className="py-2 pr-4">Сумма</th>
              <th className="py-2 pr-4">Тариф</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2 pr-4">Дата</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2 pr-4">{name(p.profile_id)}</td>
                <td className="py-2 pr-4">{p.provider}</td>
                <td className="py-2 pr-4">{formatRub(p.amount_rub)}</td>
                <td className="py-2 pr-4">{p.plan_id}</td>
                <td className="py-2 pr-4">{p.status}</td>
                <td className="py-2 pr-4">
                  {new Date(p.created_at).toLocaleString("ru-RU")}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  Платежей пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
