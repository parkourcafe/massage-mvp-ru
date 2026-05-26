import { getI18n } from "@/lib/i18n/server";
import type { ProfileMediaItem } from "@/lib/strand/types";
import { LockedMediaTile } from "./LockedMediaTile";
import { ModerationStatusBadge } from "./ModerationStatusBadge";

export async function ProfileGallery({
  title,
  items,
  locked = false,
}: {
  title: string;
  items: ProfileMediaItem[];
  locked?: boolean;
}) {
  const { messages } = await getI18n();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl text-heading">{title}</h2>
        {locked ? (
          <p className="text-sm text-secondary">{messages.common.lockedUntilSubscription}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) =>
          locked ? (
            <LockedMediaTile key={item.id} title={item.title} />
          ) : (
            <div
              key={item.id}
              className="flex aspect-[4/5] flex-col justify-between rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(215,195,162,0.12),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] p-5"
            >
              <ModerationStatusBadge status={item.status} />
              <div>
                <p className="font-serif text-2xl text-heading">{item.title}</p>
                <p className="mt-2 text-sm text-body">
                  {item.kind === "video"
                    ? messages.common.abstractPlaceholderVideo
                    : messages.common.abstractPlaceholderImage}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
