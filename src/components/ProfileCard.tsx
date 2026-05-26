import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { getPublicationStatusLabel } from "@/lib/i18n/labels";
import type { Profile } from "@/lib/types";
import type { DirectoryProfile } from "@/lib/strand/types";
import { StatusBadge } from "./StatusBadge";

type ProfileCardProps = {
  profile: DirectoryProfile | Profile;
  source?: string;
};

function isStrandProfile(profile: DirectoryProfile | Profile): profile is DirectoryProfile {
  return "displayName" in profile;
}

export async function ProfileCard({ profile }: ProfileCardProps) {
  const { locale, messages } = await getI18n();

  if (!isStrandProfile(profile)) {
    return (
      <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-soft transition-transform hover:-translate-y-1">
        <div className="relative h-72 bg-[radial-gradient(circle_at_top,_rgba(215,195,162,0.18),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))]">
          <div className="absolute inset-6 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.14),_transparent_30%),radial-gradient(circle_at_70%_40%,_rgba(215,195,162,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]" />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-3xl text-heading">{profile.full_name}</h3>
              <p className="mt-2 text-sm text-body">{profile.headline ?? "Professional profile"}</p>
            </div>
            <StatusBadge tone={profile.moderation_status === "approved" ? "success" : "warning"}>
              {profile.moderation_status}
            </StatusBadge>
          </div>
          <p className="text-sm leading-7 text-body">
            {profile.professional_description ?? "Legacy prototype profile card preserved for compatibility."}
          </p>
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-body">
            <span>{profile.city ?? "Australia"}</span>
            <Link href={`/therapist/${profile.slug}`} className="btn-secondary !px-5 !py-2.5">
              {messages.common.viewProfile}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const verified = profile.kycStatus === "approved";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-soft transition-transform hover:-translate-y-1">
      <div className="relative h-72 bg-[radial-gradient(circle_at_top,_rgba(215,195,162,0.18),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))]">
        <div className="absolute inset-6 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.14),_transparent_30%),radial-gradient(circle_at_70%_40%,_rgba(215,195,162,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]" />
        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          {verified ? (
            <StatusBadge tone="success">{messages.common.verified}</StatusBadge>
          ) : (
            <StatusBadge tone="warning">{messages.common.kycPending}</StatusBadge>
          )}
          <StatusBadge tone="accent">{profile.city}</StatusBadge>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl text-heading">{profile.displayName}</h3>
            <p className="mt-2 text-sm text-body">{profile.headline}</p>
          </div>
          <StatusBadge tone={profile.publicationStatus === "live" ? "success" : "warning"}>
            {getPublicationStatusLabel(locale, profile.publicationStatus)}
          </StatusBadge>
        </div>
        <p className="text-sm leading-7 text-body">{profile.shortBio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-body">
          <span>${profile.subscriptionPrice}/month</span>
          <Link href={`/models/${profile.slug}`} className="btn-secondary !px-5 !py-2.5">
            {messages.common.viewProfile}
          </Link>
        </div>
      </div>
    </article>
  );
}
