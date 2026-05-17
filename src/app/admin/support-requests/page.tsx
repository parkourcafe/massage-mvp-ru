import { listSupportRequests } from "@/lib/db";
import { AdminAction } from "@/components/AdminAction";

export default function AdminSupportRequestsPage() {
  const requests = listSupportRequests();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Заявки в поддержку</h1>
      <div className="space-y-2">
        {requests.length === 0 && (
          <p className="text-sm text-slate-500">Заявок нет.</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="card space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-medium">
                {r.name}{" "}
                <span className="badge bg-slate-100 text-slate-700 ml-1">
                  {r.status}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {r.contact_method}: {r.contact_value} · {r.preferred_contact_time}
              </p>
            </div>
            <p className="text-sm">
              <span className="text-slate-500">Тема:</span> {r.topic}
            </p>
            {r.message && <p className="text-sm text-slate-600">{r.message}</p>}
            <div className="flex gap-2">
              <AdminAction
                label="В работу"
                variant="secondary"
                payload={{
                  action: "update_support",
                  id: r.id,
                  status: "in_progress",
                }}
              />
              <AdminAction
                label="Готово"
                payload={{
                  action: "update_support",
                  id: r.id,
                  status: "done",
                }}
              />
              <AdminAction
                label="Отменить"
                payload={{
                  action: "update_support",
                  id: r.id,
                  status: "cancelled",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
