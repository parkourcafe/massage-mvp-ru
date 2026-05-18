import Link from "next/link";
import type { Profile } from "@/lib/types";
import { modalityLabel } from "@/lib/catalog";
import { formatRub, formatSlot, isSameDay } from "@/lib/util";
import { listOpenSlots } from "@/lib/db";
import { FavoriteButton } from "./FavoriteButton";

export async function ProfileCard({
  profile,
  source = "directory",
  matchScore,
}: {
  profile: Profile;
  source?: "directory" | "profile" | "match";
  matchScore?: number;
}) {
  const photo = (profile.media ?? []).find((m) => m.type === "profile_photo");
  const openSlots = await listOpenSlots(profile.id);
  const upcomingSlot = openSlots[0] ?? null;
  const availableToday = openSlots.some((s) =>
    isSameDay(new Date(s.starts_at), new Date())
  );
  const services = (profile.services ?? []).slice(0, 4);
  const priceFrom =
    profile.price_from ??
    Math.min(
      ...(profile.services ?? [])
        .map((s) => s.price ?? Infinity)
        .filter((n) => Number.isFinite(n))
    );

  return (
    <div className="card-interactive flex flex-col gap-4">
      <div className="flex gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt_text ?? profile.full_name}
            className="h-20 w-20 rounded-xl object-cover bg-sand-100 ring-1 ring-sand-200"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-serif font-semibold">
            {profile.full_name.slice(0, 1)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/therapist/${profile.slug}`}
              className="font-serif text-lg font-semibold text-ink hover:text-brand-700"
            >
              {profile.full_name}
            </Link>
            {profile.plan_id === "expert" && (
              <span className="badge bg-clay-100 text-clay-600">ТОП</span>
            )}
            {typeof matchScore === "number" && (
              <span className="badge bg-brand-100 text-brand-800">
                Совпадение {matchScore}%
              </span>
            )}
            {availableToday && (
              <span className="badge bg-brand-600 text-white">
                Свободно сегодня
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted mt-0.5">
            {[profile.city, profile.district].filter(Boolean).join(", ")}
            {profile.years_experience
              ? ` · опыт ${profile.years_experience} лет`
              : ""}
          </p>
          {profile.headline && (
            <p className="text-sm text-ink-soft mt-1.5 line-clamp-2">
              {profile.headline}
            </p>
          )}
          {upcomingSlot && (
            <p className="text-xs font-medium text-brand-700 mt-2">
              Ближайшее окно: {formatSlot(upcomingSlot.starts_at)}
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

      <div className="flex items-center justify-between gap-3 border-t border-sand-200 pt-4">
        <span className="text-sm text-ink-soft">
          от{" "}
          <strong className="font-serif text-base text-ink">
            {formatRub(Number.isFinite(priceFrom) ? priceFrom : null)}
          </strong>
        </span>
        <div className="flex gap-2">
          <Link href={`/therapist/${profile.slug}`} className="btn-ghost">
            Профиль
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
