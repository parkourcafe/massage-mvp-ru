import Link from "next/link";
import { listAllProfiles } from "@/lib/db";
import { computeQualityScore } from "@/lib/quality";
import { AdminAction } from "@/components/AdminAction";

export default async function AdminProfilesPage() {
  const profiles = await listAllProfiles();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Профили</h1>
      <div className="space-y-2">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="card flex items-center justify-between flex-wrap gap-2"
          >
            <div>
              <Link
                href={`/therapist/${p.slug}`}
                className="font-medium hover:text-brand-700"
              >
                {p.full_name}
              </Link>
              <p className="text-xs text-slate-500">
                {p.city ?? "—"} · качество {computeQualityScore(p).score}/100 ·
                модерация: {p.moderation_status}
              </p>
            </div>
            <div className="flex gap-2">
              <AdminAction
                label="Одобрить"
                variant="secondary"
                payload={{
                  action: "set_moderation",
                  profileId: p.id,
                  status: "approved",
                }}
              />
              <AdminAction
                label="Отклонить"
                payload={{
                  action: "set_moderation",
                  profileId: p.id,
                  status: "rejected",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
