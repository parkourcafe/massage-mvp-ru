import Link from "next/link";
import { listLiveAvailability } from "@/lib/db";
import { AdminAction } from "@/components/AdminAction";

export const dynamic = "force-dynamic";

const MODE_LABEL: Record<string, string> = {
  current_location: "текущая геопозиция",
  manual_area: "район вручную",
  saved_service_area: "сохранённые зоны",
  hidden_exact_location: "скрытая локация",
};

export default async function AdminNearbyPage() {
  const live = await listLiveAvailability();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Активны «Рядом»
        </h1>
        <p className="text-sm text-slate-500">
          Мастера, которые сейчас включили доступность ({live.length}).
          Деактивация немедленно убирает мастера из поиска.
        </p>
      </div>
      {live.length === 0 && (
        <div className="card text-sm text-slate-500">
          Сейчас никто не активен.
        </div>
      )}
      <div className="space-y-2">
        {live.map(({ availability: a, profile: p }) => (
          <div
            key={a.id}
            className="card flex flex-wrap items-center justify-between gap-2"
          >
            <div>
              <Link
                href={`/therapist/${p.slug}`}
                className="font-medium hover:text-brand-700"
              >
                {p.full_name}
              </Link>
              <p className="text-xs text-slate-500">
                {a.date}, {a.start_time}–{a.end_time} · режим:{" "}
                {MODE_LABEL[a.location_mode] ?? a.location_mode} · район:{" "}
                {a.approximate_area ?? "—"} · радиус {a.service_radius_km}{" "}
                км · модерация: {p.moderation_status}
              </p>
            </div>
            <AdminAction
              label="Деактивировать"
              payload={{
                action: "deactivate_availability",
                profileId: p.id,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
