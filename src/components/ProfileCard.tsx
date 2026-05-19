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
            className="h-20 w-20 shrink-0 rounded-xl2 object-cover ring-1 ring-line-strong"
          />
        ) : (
          <div className="img-ph h-20 w-20 shrink-0 rounded-xl2 font-serif !text-xl !tracking-normal text-heading">
            {profile.full_name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/therapist/${profile.slug}`}
              className="font-serif text-lg text-heading transition-colors hover:text-accent"
            >
              {profile.full_name}
            </Link>
            {profile.plan_id === "expert" && (
              <span className="badge">★ ТОП</span>
            )}
            {typeof matchScore === "number" && (
              <span className="chip-brand">Совпадение {matchScore}%</span>
            )}
            {availableToday && (
              <span className="badge">Свободно сегодня</span>
            )}
          </div>
          <p className="mt-1 text-sm text-secondary">
            {[profile.city, profile.district].filter(Boolean).join(", ")}
            {profile.years_experience
              ? ` · опыт ${profile.years_experience} лет`
              : ""}
          </p>
          {profile.headline && (
            <p className="mt-1.5 line-clamp-2 text-sm text-body">
              {profile.headline}
            </p>
          )}
          {upcomingSlot && (
            <p className="mt-2 font-serif text-sm text-accent">
              Ближайшее окно: {formatSlot(upcomingSlot.starts_at)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {services.map((s) => (
          <span key={s.id} className="chip-brand">
            {modalityLabel(s.modality)}
          </span>
        ))}
      </div>

      <hr className="rule" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-secondary">
          от{" "}
          <strong className="font-serif text-lg text-heading">
            {formatRub(Number.isFinite(priceFrom) ? priceFrom : null)}
          </strong>
        </span>
        <div className="flex gap-2">
          <Link
            href={`/therapist/${profile.slug}`}
            className="btn-secondary btn-sm"
          >
            Профиль
          </Link>
          <Link
            href={`/therapist/${profile.slug}/booking`}
            className="btn-primary btn-sm"
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
