import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfileBySlug, listOpenSlots } from "@/lib/db";
import { isIndexable } from "@/lib/quality";
import { modalityLabel, citySlug } from "@/lib/catalog";
import { formatRub, formatSlot } from "@/lib/util";
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
  const openSlots = (await listOpenSlots(p.id)).slice(0, 8);

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
    <div className="container-px py-10 lg:py-14">
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

      {/* Breadcrumb */}
      <nav className="small flex flex-wrap items-center gap-2 text-secondary">
        <Link href="/" className="hover:text-heading transition-colors">
          Главная
        </Link>
        <span>/</span>
        <Link
          href="/therapists"
          className="hover:text-heading transition-colors"
        >
          Каталог
        </Link>
        {p.city && cSlug && (
          <>
            <span>/</span>
            <Link
              href={`/therapists/${cSlug}`}
              className="hover:text-heading transition-colors"
            >
              {p.city}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-heading">{p.full_name}</span>
      </nav>

      {/* HERO */}
      <section className="mt-8 grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-16 items-start">
        {/* Left: photo cluster */}
        <div className="space-y-3">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={photo.alt_text ?? p.full_name}
              className="w-full aspect-[4/5] rounded-xl2 ring-1 ring-line-strong object-cover"
            />
          ) : (
            <div className="img-ph w-full aspect-[4/5] rounded-xl2">
              {p.full_name.slice(0, 1)}
            </div>
          )}
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {gallery.slice(0, 4).map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt_text ?? "Фото"}
                  className="w-full aspect-square rounded-xl ring-1 ring-line-strong object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: identity + stats + meta */}
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">Верифицирован</span>
            {p.years_experience && p.years_experience >= 10 && (
              <span className="chip-brand">Pro · 10+ лет</span>
            )}
          </div>
          <h1 className="h1 mt-5">{p.full_name}</h1>
          {p.headline && (
            <p className="body-lg mt-3 text-accent">{p.headline}</p>
          )}

          {/* Stat row */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl2 border border-line bg-line">
            <div className="bg-card px-5 py-5">
              <div className="serif text-2xl text-heading">
                {p.years_experience ? p.years_experience : "—"}
              </div>
              <div className="small mt-1">лет в практике</div>
            </div>
            <div className="bg-card px-5 py-5">
              <div className="serif text-2xl text-heading">
                {services.length || "—"}
              </div>
              <div className="small mt-1">услуг</div>
            </div>
            <div className="bg-card px-5 py-5">
              <div className="serif text-2xl text-heading truncate">
                {p.languages.length > 0 ? p.languages.join(" / ") : "RU"}
              </div>
              <div className="small mt-1">языки приёма</div>
            </div>
            <div className="bg-card px-5 py-5">
              <div className="serif text-2xl text-accent">
                {openSlots.length > 0
                  ? formatSlot(openSlots[0].starts_at)
                  : "по запросу"}
              </div>
              <div className="small mt-1">ближайший слот</div>
            </div>
          </div>

          {/* Meta lines */}
          <dl className="mt-7 space-y-4">
            <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline">
              <dt className="small">Где принимает</dt>
              <dd className="text-heading text-[15px]">
                {[p.city, p.district].filter(Boolean).join(", ") || "—"}
                {p.show_gender && p.gender
                  ? ` · ${p.gender === "female" ? "женщина" : "мужчина"}`
                  : ""}
              </dd>
            </div>
            {p.public_location_label && (
              <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline">
                <dt className="small">Локация</dt>
                <dd className="text-heading text-[15px]">
                  {p.public_location_label}
                </dd>
              </div>
            )}
            {p.languages.length > 0 && (
              <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline">
                <dt className="small">Языки</dt>
                <dd className="text-heading text-[15px]">
                  {p.languages.join(", ")}
                </dd>
              </div>
            )}
          </dl>

          <hr className="rule my-7" />

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="small mb-1">Сеанс от</div>
              <div className="serif text-4xl text-heading">
                {formatRub(p.price_from)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <FavoriteButton
                profileId={p.id}
                source="profile"
                className="btn-ghost btn-sm"
              />
              <Link
                href={`/therapist/${p.slug}/booking`}
                className="btn-primary btn-lg"
              >
                Записаться на сеанс
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule mt-12" />

      {/* CONTENT */}
      <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-14">
        <div className="lg:col-span-2 space-y-14">
          {openSlots.length > 0 && (
            <section>
              <p className="eyebrow">
                <span className="num-label">01</span> Запись
              </p>
              <h2 className="h2 mt-4">Свободное время — бронь онлайн</h2>
              <p className="small mt-3">
                Выберите окно — запись подтвердится сразу, без ожидания ответа.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {openSlots.map((s) => (
                  <Link
                    key={s.id}
                    href={`/therapist/${p.slug}/booking?slot=${s.id}`}
                    className="rounded-xl border border-line bg-card px-4 py-3.5 text-center serif text-[15px] text-heading hover:border-line-strong hover:text-accent transition-colors"
                  >
                    {formatSlot(s.starts_at)}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {p.professional_description && (
            <section>
              <p className="eyebrow">
                <span className="num-label">02</span> О мастере
              </p>
              <h2 className="h2 mt-4">Письмо от мастера</h2>
              <p className="body-lg mt-5 text-body whitespace-pre-line">
                {p.professional_description}
              </p>
            </section>
          )}

          <section>
            <p className="eyebrow">
              <span className="num-label">03</span> Услуги
            </p>
            <h2 className="h2 mt-4">Услуги и цены</h2>
            <div className="mt-6 flex flex-col">
              {services.map((s, i) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-[40px_1fr_auto] gap-6 items-baseline py-7 border-b border-line ${
                    i === 0 ? "border-t border-line" : ""
                  }`}
                >
                  <div className="num-label text-lg">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="small mb-2">
                      <span className="chip">{modalityLabel(s.modality)}</span>
                    </div>
                    <h3 className="h3">{s.title}</h3>
                    {s.description && (
                      <p className="small mt-2 max-w-prose text-body">
                        {s.description}
                      </p>
                    )}
                    {s.contraindication_note && (
                      <p className="small mt-2 text-mag-300">
                        Противопоказания: {s.contraindication_note}
                      </p>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="serif text-xl text-heading">
                      {formatRub(s.price)}
                    </div>
                    {s.duration && (
                      <div className="small mt-1">{s.duration} мин</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="eyebrow">
              <span className="num-label">04</span> Формат
            </p>
            <h2 className="h2 mt-4">Формат работы</h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {[
                p.works_at_own_place && "Принимает у себя",
                p.travels_to_client && "Выезжает к клиенту",
                p.works_in_hotels && "Работает в отелях",
                p.works_in_villas && "Работает на виллах",
                p.works_in_salon && "Работает в салоне / студии",
                p.travel_districts.length > 0 &&
                  `Районы выезда: ${p.travel_districts.join(", ")}`,
                p.minimum_booking_price != null &&
                  `Мин. стоимость: ${formatRub(p.minimum_booking_price)}`,
                p.transport_fee != null &&
                  `Плата за выезд: ${formatRub(p.transport_fee)}`,
              ]
                .filter(Boolean)
                .map((line, i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-3 text-[15px] text-heading"
                  >
                    <span className="text-accent">·</span>
                    {line}
                  </li>
                ))}
            </ul>
            <p className="small mt-4">
              Точный адрес специалиста не публикуется и сообщается лично после
              подтверждённой записи при необходимости.
            </p>
          </section>

          {gallery.length > 0 && (
            <section>
              <p className="eyebrow">
                <span className="num-label">05</span> Кабинет
              </p>
              <h2 className="h2 mt-4">Фото кабинета и оборудования</h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m.id}
                    src={m.url}
                    alt={m.alt_text ?? "Фото"}
                    className="aspect-square rounded-xl2 ring-1 ring-line-strong object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <p className="eyebrow">Видео</p>
              <h2 className="h2 mt-4">Видео</h2>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {videos.map((m) => {
                  const embed = videoEmbed(m.url);
                  return embed ? (
                    <iframe
                      key={m.id}
                      src={embed}
                      title={m.title ?? "Видео"}
                      className="aspect-video w-full rounded-xl2 border border-line-strong"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      key={m.id}
                      href={m.url}
                      className="text-accent underline text-sm"
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
              <p className="eyebrow">Квалификация</p>
              <h2 className="h2 mt-4">Сертификаты и дипломы</h2>
              <ul className="mt-5 flex flex-col">
                {certs.map((m, i) => (
                  <li
                    key={m.id}
                    className={`flex items-baseline gap-4 py-4 border-b border-line ${
                      i === 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <span className="text-accent">✓</span>
                    <a
                      href={m.url}
                      className="text-[15px] text-heading underline decoration-line-strong underline-offset-4 hover:text-accent transition-colors"
                    >
                      {m.title ?? "Документ о квалификации"}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <p className="eyebrow">Отзывы</p>
              <h2 className="h2 mt-4">Отзывы клиентов</h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reviews.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m.id}
                    src={m.url}
                    alt={m.alt_text ?? "Отзыв"}
                    className="rounded-xl2 ring-1 ring-line-strong bg-card"
                  />
                ))}
              </div>
            </section>
          )}

          {p.safety_boundaries && (
            <section className="card bg-accent-soft border-line">
              <h2 className="h3 text-accent">
                Профессиональные границы и безопасность
              </h2>
              <p className="mt-3 text-sm text-body whitespace-pre-line">
                {p.safety_boundaries}
              </p>
              <p className="small mt-3">{MEDICAL_DISCLAIMER}</p>
            </section>
          )}

          {(p.faq ?? []).length > 0 && (
            <section>
              <p className="eyebrow">FAQ</p>
              <h2 className="h2 mt-4">Частые вопросы</h2>
              <div className="mt-5 flex flex-col">
                {p.faq.map((f, i) => (
                  <div
                    key={i}
                    className={`py-5 border-b border-line ${
                      i === 0 ? "border-t border-line" : ""
                    }`}
                  >
                    <p className="font-medium text-heading">{f.q}</p>
                    <p className="mt-1.5 text-sm text-body">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card sticky top-24 space-y-3">
            <p className="small">Стоимость</p>
            <p className="serif text-3xl text-heading">
              от {formatRub(p.price_from)}
            </p>
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
            <p className="small pt-3 border-t border-line">
              {PLATFORM_NOTICE}
            </p>
          </div>

          {contacts.length > 0 && (
            <div className="card space-y-3">
              <p className="eyebrow">Связаться</p>
              <ContactLinks profileId={p.id} contacts={contacts} />
              <p className="small">
                Личный телефон и точный адрес не публикуются.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
