import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/db";
import { isIndexable } from "@/lib/quality";
import { modalityLabel, citySlug } from "@/lib/catalog";
import { formatRub } from "@/lib/util";
import { pageMetadata, MEDICAL_DISCLAIMER, PLATFORM_NOTICE } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  therapistJsonLd,
} from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Tracking } from "@/components/Tracking";
import { ContactLinks } from "@/components/ContactLinks";
import { videoEmbed } from "@/lib/video";
import type { ContactChannel } from "@/lib/types";

type Params = { params: { slug: string } };

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const p = await getPublicProfileBySlug(params.slug);
  if (!p) return pageMetadata({ title: "Профиль не найден", noindex: true });
  // Index only if profile quality score >= 70.
  return pageMetadata({
    title: `${p.full_name} — ${p.headline ?? "массажист"}`,
    description: p.headline ?? p.professional_description ?? undefined,
    path: `/therapist/${p.slug}`,
    noindex: !isIndexable(p),
  });
}

export default async function TherapistProfilePage({ params }: Params) {
  const p = await getPublicProfileBySlug(params.slug);
  if (!p) notFound();

  const media = p.media ?? [];
  const photo = media.find((m) => m.type === "profile_photo");
  const gallery = media.filter((m) =>
    ["gallery_photo", "workspace_photo", "equipment_photo"].includes(m.type)
  );
  const certs = media.filter((m) =>
    ["certificate", "diploma"].includes(m.type)
  );
  const reviews = media.filter((m) => m.type === "review_screenshot");
  const videos = media.filter((m) =>
    ["intro_video", "session_video"].includes(m.type)
  );
  const services = (p.services ?? []).filter((s) => s.is_published);

  const waDigits = (p.whatsapp ?? "").replace(/[^\d]/g, "");
  const contacts = [
    waDigits
      ? {
          label: "WhatsApp",
          href: `https://wa.me/${waDigits}`,
          channel: "whatsapp" as ContactChannel,
        }
      : null,
    p.telegram_url
      ? {
          label: "Telegram",
          href: p.telegram_url,
          channel: "telegram" as ContactChannel,
        }
      : null,
    p.vk_url
      ? { label: "VK", href: p.vk_url, channel: "vk" as ContactChannel }
      : null,
    p.instagram_url
      ? {
          label: "Instagram",
          href: p.instagram_url,
          channel: "instagram" as ContactChannel,
        }
      : null,
    p.website_url
      ? {
          label: "Сайт",
          href: p.website_url,
          channel: "website" as ContactChannel,
        }
      : null,
  ].filter(Boolean) as {
    label: string;
    href: string;
    channel: ContactChannel;
  }[];

  const cSlug = citySlug(p.city);
  const breadcrumb = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/therapists" },
    ...(p.city && cSlug
      ? [{ name: p.city, path: `/therapists/${cSlug}` }]
      : []),
    { name: p.full_name, path: `/therapist/${p.slug}` },
  ];

  return (
    <div className="container-px py-10 grid lg:grid-cols-3 gap-8">
      {isIndexable(p) && (
        <JsonLd
          data={[
            therapistJsonLd(p),
            breadcrumbJsonLd(breadcrumb),
            ...((p.faq ?? []).length > 0 ? [faqJsonLd(p.faq)] : []),
          ]}
        />
      )}
      <Tracking profileId={p.id} path={`/therapist/${p.slug}`} />
      <div className="lg:col-span-2 space-y-8">
        <div className="flex gap-5 items-start">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={photo.alt_text ?? p.full_name}
              className="h-28 w-28 rounded-xl object-cover bg-slate-100"
            />
          ) : (
            <div className="h-28 w-28 rounded-xl bg-brand-100 flex items-center justify-center text-3xl font-semibold text-brand-700">
              {p.full_name.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {p.full_name}
            </h1>
            <p className="text-slate-600">{p.headline}</p>
            <p className="text-sm text-slate-500 mt-1">
              {[p.city, p.district].filter(Boolean).join(", ")}
              {p.show_gender && p.gender
                ? ` · ${p.gender === "female" ? "женщина" : "мужчина"}`
                : ""}
              {p.years_experience ? ` · опыт ${p.years_experience} лет` : ""}
            </p>
            {p.languages.length > 0 && (
              <p className="text-sm text-slate-500">
                Языки: {p.languages.join(", ")}
              </p>
            )}
            {p.public_location_label && (
              <p className="text-sm text-slate-500 mt-1">
                Локация: {p.public_location_label}
              </p>
            )}
          </div>
        </div>

        {p.professional_description && (
          <section>
            <h2 className="font-semibold text-slate-900">О специалисте</h2>
            <p className="mt-2 text-slate-700 whitespace-pre-line">
              {p.professional_description}
            </p>
          </section>
        )}

        <section>
          <h2 className="font-semibold text-slate-900">Услуги и цены</h2>
          <div className="mt-3 space-y-3">
            {services.map((s) => (
              <div key={s.id} className="card">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {s.title}{" "}
                      <span className="chip ml-1">
                        {modalityLabel(s.modality)}
                      </span>
                    </p>
                    {s.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {s.description}
                      </p>
                    )}
                    {s.contraindication_note && (
                      <p className="text-xs text-amber-700 mt-1">
                        Противопоказания: {s.contraindication_note}
                      </p>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="font-semibold">{formatRub(s.price)}</p>
                    {s.duration && (
                      <p className="text-xs text-slate-500">
                        {s.duration} мин
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">Формат работы</h2>
          <ul className="mt-2 text-sm text-slate-700 grid sm:grid-cols-2 gap-1 list-disc list-inside">
            {p.works_at_own_place && <li>Принимает у себя</li>}
            {p.travels_to_client && <li>Выезжает к клиенту</li>}
            {p.works_in_hotels && <li>Работает в отелях</li>}
            {p.works_in_villas && <li>Работает на виллах</li>}
            {p.works_in_salon && <li>Работает в салоне / студии</li>}
            {p.travel_districts.length > 0 && (
              <li>Районы выезда: {p.travel_districts.join(", ")}</li>
            )}
            {p.minimum_booking_price != null && (
              <li>Мин. стоимость: {formatRub(p.minimum_booking_price)}</li>
            )}
            {p.transport_fee != null && (
              <li>Плата за выезд: {formatRub(p.transport_fee)}</li>
            )}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Точный адрес специалиста не публикуется и сообщается лично после
            подтверждённой записи при необходимости.
          </p>
        </section>

        {gallery.length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-900">
              Фото кабинета и оборудования
            </h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text ?? "Фото"}
                  className="rounded-lg object-cover aspect-square bg-slate-100"
                />
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-900">Видео</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {videos.map((m) => {
                const embed = videoEmbed(m.url);
                return embed ? (
                  <iframe
                    key={m.id}
                    src={embed}
                    title={m.title ?? "Видео"}
                    className="aspect-video w-full rounded-lg border"
                    allowFullScreen
                  />
                ) : (
                  <a
                    key={m.id}
                    href={m.url}
                    className="text-brand-700 underline text-sm"
                  >
                    {m.title ?? m.url}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {certs.length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-900">
              Сертификаты и дипломы
            </h2>
            <ul className="mt-2 text-sm list-disc list-inside text-brand-700">
              {certs.map((m) => (
                <li key={m.id}>
                  <a href={m.url} className="underline">
                    {m.title ?? "Документ о квалификации"}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {reviews.length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-900">Отзывы (скриншоты)</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {reviews.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text ?? "Отзыв"}
                  className="rounded-lg border bg-slate-100"
                />
              ))}
            </div>
          </section>
        )}

        {p.safety_boundaries && (
          <section className="card bg-brand-50 border-brand-100">
            <h2 className="font-semibold text-brand-800">
              Профессиональные границы и безопасность
            </h2>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
              {p.safety_boundaries}
            </p>
            <p className="mt-2 text-xs text-slate-500">{MEDICAL_DISCLAIMER}</p>
          </section>
        )}

        {(p.faq ?? []).length > 0 && (
          <section>
            <h2 className="font-semibold text-slate-900">Частые вопросы</h2>
            <div className="mt-2 space-y-3">
              {p.faq.map((f, i) => (
                <div key={i}>
                  <p className="font-medium text-slate-800">{f.q}</p>
                  <p className="text-sm text-slate-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card sticky top-4 space-y-3">
          <p className="text-sm text-slate-500">Стоимость</p>
          <p className="text-2xl font-bold">от {formatRub(p.price_from)}</p>
          <Link
            href={`/therapist/${p.slug}/booking`}
            className="btn-primary w-full"
          >
            Записаться на сеанс
          </Link>
          <Link
            href={`/therapist/${p.slug}/booking?intent=message`}
            className="btn-secondary w-full"
          >
            Написать специалисту
          </Link>
          <FavoriteButton
            profileId={p.id}
            source="profile"
            className="w-full"
          />
          <p className="text-xs text-slate-500 pt-2 border-t">
            {PLATFORM_NOTICE}
          </p>
        </div>

        {contacts.length > 0 && (
          <div className="card space-y-2">
            <p className="text-sm font-semibold text-slate-900">Связаться</p>
            <ContactLinks profileId={p.id} contacts={contacts} />
            <p className="text-xs text-slate-500">
              Личный телефон и точный адрес не публикуются.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
