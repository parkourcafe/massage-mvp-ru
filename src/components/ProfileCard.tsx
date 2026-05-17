import Link from "next/link";
import type { Profile } from "@/lib/types";
import { modalityLabel } from "@/lib/catalog";
import { formatRub } from "@/lib/util";
import { FavoriteButton } from "./FavoriteButton";

export function ProfileCard({
  profile,
  source = "directory",
  matchScore,
}: {
  profile: Profile;
  source?: "directory" | "profile" | "match";
  matchScore?: number;
}) {
  const photo = (profile.media ?? []).find((m) => m.type === "profile_photo");
  const services = (profile.services ?? []).slice(0, 4);
  const priceFrom =
    profile.price_from ??
    Math.min(
      ...(profile.services ?? [])
        .map((s) => s.price ?? Infinity)
        .filter((n) => Number.isFinite(n))
    );

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt_text ?? profile.full_name}
            className="h-20 w-20 rounded-lg object-cover bg-slate-100"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-semibold">
            {profile.full_name.slice(0, 1)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/therapist/${profile.slug}`}
              className="font-semibold text-slate-900 hover:text-brand-700"
            >
              {profile.full_name}
            </Link>
            {profile.plan_id === "expert" && (
              <span className="badge bg-amber-100 text-amber-800">ТОП</span>
            )}
            {typeof matchScore === "number" && (
              <span className="badge bg-brand-100 text-brand-800">
                Совпадение {matchScore}%
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {[profile.city, profile.district].filter(Boolean).join(", ")}
            {profile.years_experience
              ? ` · опыт ${profile.years_experience} лет`
              : ""}
          </p>
          {profile.headline && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {profile.headline}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {services.map((s) => (
          <span key={s.id} className="chip">
            {modalityLabel(s.modality)}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700">
          от <strong>{formatRub(Number.isFinite(priceFrom) ? priceFrom : null)}</strong>
        </span>
        <div className="flex gap-2">
          <Link href={`/therapist/${profile.slug}`} className="btn-ghost">
            Открыть профиль
          </Link>
          <Link
            href={`/therapist/${profile.slug}/booking`}
            className="btn-primary"
          >
            Записаться
          </Link>
        </div>
      </div>
      <FavoriteButton
        profileId={profile.id}
        source={source}
        matchScore={matchScore}
        className="w-full"
      />
    </div>
  );
}
