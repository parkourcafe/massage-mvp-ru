import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ComplianceDisclaimer } from "@/components/ComplianceDisclaimer";
import { ProfileGallery } from "@/components/ProfileGallery";
import { StatusBadge } from "@/components/StatusBadge";
import { SubscriptionCTA } from "@/components/SubscriptionCTA";
import { getI18n } from "@/lib/i18n/server";
import { getPublicationStatusLabel } from "@/lib/i18n/labels";
import { getDirectoryProfile } from "@/lib/strand/repository";

export default async function ModelProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { locale, messages } = await getI18n();
  const profile = await getDirectoryProfile(params.slug);
  if (!profile) notFound();

  const verified = profile.kycStatus === "approved";

  return (
    <AppShell
      eyebrow={locale === "ru" ? "Публичный профиль" : "Public profile"}
      title={profile.displayName}
      intro={profile.longBio}
      actions={
        verified ? (
          <StatusBadge tone="success">{messages.common.verified}</StatusBadge>
        ) : (
          <StatusBadge tone="warning">{messages.common.kycPending}</StatusBadge>
        )
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel overflow-hidden">
          <div className="h-80 bg-[radial-gradient(circle_at_25%_15%,_rgba(215,195,162,0.16),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))]" />
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={verified ? "success" : "warning"}>
                {verified
                  ? locale === "ru"
                    ? "Verified-профиль"
                    : "Verified profile"
                  : locale === "ru"
                    ? "Требуется верификация"
                    : "Verification required"}
              </StatusBadge>
              <StatusBadge tone="accent">{profile.city}, {profile.state}</StatusBadge>
            </div>
            <p className="text-lg text-heading">{profile.headline}</p>
            <p className="text-sm leading-7 text-body">{profile.shortBio}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-secondary">{messages.common.availability}</p>
                <p className="mt-2 text-sm text-body">{profile.availability}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-secondary">{messages.common.publicationState}</p>
                <p className="mt-2 text-sm text-body">
                  {getPublicationStatusLabel(locale, profile.publicationStatus)}
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-6">
          <SubscriptionCTA price={profile.subscriptionPrice} modelName={profile.displayName} />
          <ComplianceDisclaimer
            body={
              locale === "ru"
                ? "Презентация профиля, moderation status и subscription access на этой странице являются placeholder-структурой для 18+ marketplace и должны оставаться compliant, privacy-first и non-explicit."
                : "Profile presentation, moderation status, and subscription access on this page are placeholders for an 18+ marketplace and must remain compliant, privacy-first, and non-explicit."
            }
          />
          <Link href="/legal/report-a-concern" className="btn-ghost w-full">
            {messages.common.reportProfile}
          </Link>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        <ProfileGallery title={messages.common.publicGallery} items={profile.publicMedia} />
        <ProfileGallery title={messages.common.privateGallery} items={profile.privateMedia} locked />
      </div>
    </AppShell>
  );
}
