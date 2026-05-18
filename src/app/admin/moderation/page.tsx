import { listModerationFlags } from "@/lib/db";
import { AdminAction } from "@/components/AdminAction";

export default async function AdminModerationPage() {
  const flags = await listModerationFlags();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Модерация</h1>
      <p className="text-sm text-slate-600">
        Флаги: эротика/интим (блок), подозрительные заголовки и небезопасные
        медицинские заявления (ручная проверка). Фото проверяются вручную.
      </p>
      <div className="space-y-2">
        {flags.length === 0 && (
          <p className="text-sm text-slate-500">Активных флагов нет.</p>
        )}
        {flags.map((f) => (
          <div
            key={f.id}
            className="card flex items-center justify-between flex-wrap gap-2"
          >
            <div>
              <p className="font-medium">
                {f.profile?.full_name ?? "—"}{" "}
                <span
                  className={`badge ml-1 ${
                    f.severity === "block"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {f.category} · {f.severity}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Совпадение: «{f.matched_text}»
              </p>
            </div>
            <div className="flex gap-2">
              <AdminAction
                label="Снять флаг"
                payload={{ action: "resolve_flag", id: f.id }}
              />
              {f.profile && (
                <AdminAction
                  label="Заблокировать профиль"
                  payload={{
                    action: "set_moderation",
                    profileId: f.profile.id,
                    status: "rejected",
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
