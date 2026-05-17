import { listAllProfiles } from "@/lib/db";

export default function AdminUsersPage() {
  const profiles = listAllProfiles();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Пользователи</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-4">user_id</th>
              <th className="py-2 pr-4">Имя</th>
              <th className="py-2 pr-4">Город</th>
              <th className="py-2 pr-4">Тариф</th>
              <th className="py-2 pr-4">Опубликован</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2 pr-4">{p.user_id ?? "—"}</td>
                <td className="py-2 pr-4">{p.full_name}</td>
                <td className="py-2 pr-4">{p.city ?? "—"}</td>
                <td className="py-2 pr-4">{p.plan_id}</td>
                <td className="py-2 pr-4">{p.is_published ? "да" : "нет"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
