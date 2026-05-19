import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { MODALITIES, SAFETY_RULES } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { ProfileCard } from "@/components/ProfileCard";
import {
  Counter,
  CursorGlow,
  HoverCursor,
  LivePulse,
  Magnetic,
  MeshBlob,
  ScrollBoldHeading,
  Tilt,
} from "@/components/effects";
import { OpenPalette } from "@/components/AIPalette";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Профессиональный массаж — подбор специалиста",
  description:
    "AI-платформа для независимых профессиональных массажистов. Найдите проверенного специалиста или подберите с помощью AI.",
  path: "/",
});

const HERO_TAGS = MODALITIES.slice(0, 6);

const MARQUEE = [
  "независимая практика",
  "никаких салонов",
  "0 посредников",
  "проверенные профили",
  "свой почерк",
  "ваш ритм",
  "онлайн-бронь",
];

const STEPS = [
  {
    n: "01",
    title: "по руке",
    lead: "Выберите",
    text: "Не по адресу и не по картинке. Портфолио, описание техники, профессиональные границы и модерация у каждого специалиста.",
  },
  {
    n: "02",
    title: "в один тап",
    lead: "Запись",
    text: "Свободные окна видно в реальном времени. Бронь подтверждается без долгих переписок и перезвонов.",
  },
  {
    n: "03",
    title: "мастеру",
    lead: "Платите",
    text: "Никаких предоплат платформе. Вы платите ровно столько, сколько указано у специалиста в прайсе.",
  },
];

const NEEDS: { label: string; slug: string }[] = [
  { label: "Шея и шейно-воротниковая зона", slug: "shei-i-plech" },
  { label: "Спина и поясница", slug: "spiny" },
  { label: "Глубокотканная проработка", slug: "glubokotkannyy" },
  { label: "Спортивное восстановление", slug: "sportivnyy" },
  { label: "Лимфодренаж и отёки", slug: "limfodrenazhnyy" },
  { label: "Массаж для беременных", slug: "dlya-beremennyh" },
];

export default async function HomePage() {
  const profiles = await listPublicProfiles();
  const featured = profiles.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="bg-calm-hero">
       <CursorGlow>
        <div className="container-px grid items-center gap-16 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10">
            <span className="eyebrow">
              <span className="num-label not-italic">↳</span> Платформа
              независимых массажистов
            </span>
            <h1 className="display mt-7 text-balance">
              Не салон.
              <br />
              <span className="italic hot">Частная</span>
              <br />
              практика.
            </h1>
            <p className="body-lg mt-9 max-w-md text-xl leading-snug">
              Массажисты, у которых вас знают по имени.{" "}
              <em className="text-heading">
                Свой кабинет, своя кушетка, свой ритм
              </em>{" "}
              — и календарь, который реально работает.
            </p>

            <div className="mt-10 flex max-w-xl items-center gap-2 rounded-full border border-line-strong bg-surface p-2 shadow-soft">
              <span className="flex flex-1 items-center gap-2 px-5 py-3 text-sm text-body">
                <span className="hot">✦</span> Любой массаж · Санкт-Петербург
              </span>
              <Link
                href="/therapists"
                className="btn-primary btn-sm shrink-0"
              >
                Показать <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/nearby" className="btn-accent btn-sm">
                Найти массаж рядом
              </Link>
              <Link href="/match" className="btn-secondary btn-sm">
                Подобрать с AI
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {HERO_TAGS.map((m) => (
                <Link
                  key={m.key}
                  href={`/therapists/${m.slug}`}
                  className="rounded-full border border-line px-3.5 py-2 text-xs text-body transition-colors hover:border-line-strong hover:text-heading"
                >
                  {m.label.replace(" массаж", "")}
                </Link>
              ))}
            </div>
          </div>

          {/* Photo cluster + floating cards */}
          <div className="relative hidden h-[560px] lg:block">
            <div
              aria-hidden
              className="pointer-events-none absolute right-[18%] top-[26%] z-0"
            >
              <MeshBlob size={560} />
            </div>
            <div className="img-ph absolute right-10 top-0 h-[440px] w-[300px] rounded-xl2 shadow-lift">
              портрет / руки
            </div>
            <div className="img-ph absolute bottom-0 left-0 h-[260px] w-[210px] rounded-xl2 shadow-lift">
              кабинет
            </div>
            {featured[0] && (
              <div className="absolute left-[-16px] top-14 z-10 flex w-[250px] items-center gap-3 rounded-xl2 border border-line-strong bg-card p-4 shadow-lift">
                <div className="img-ph h-12 w-12 shrink-0 rounded-full text-[8px]">
                  {featured[0].full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-serif text-[17px] text-heading">
                    {featured[0].full_name}
                  </div>
                  <div className="small mt-0.5 flex items-center gap-1">
                    <span className="hot">★</span>
                    {featured[0].city ?? "Санкт-Петербург"}
                  </div>
                </div>
              </div>
            )}
            <OpenPalette className="group absolute bottom-10 right-[-16px] z-10 block w-[300px] overflow-hidden rounded-xl2 border border-line-strong bg-card/80 p-5 text-left shadow-lift backdrop-blur-md transition-transform hover:-translate-y-1">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 animate-shimmer motion-reduce:hidden"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 35%, rgba(236,72,137,0.18) 50%, transparent 65%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <span aria-hidden className="hot text-xs">
                  ✦
                </span>
                <span className="eyebrow !text-accent">Massaje AI</span>
              </span>
              <span className="relative z-10 mt-2 block font-serif text-[17px] leading-snug text-heading">
                Опишите задачу — подберём специалистов и техники под вас.
              </span>
              <span className="relative z-10 mt-3 flex items-center gap-1.5 text-xs text-accent">
                Подобрать с AI{" "}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </OpenPalette>
          </div>
        </div>

        {/* Stats strip */}
        <div className="container-px">
          <div className="grid gap-8 border-t border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                v:
                  profiles.length > 0 ? (
                    <Counter value={profiles.length} />
                  ) : (
                    "Проверенные"
                  ),
                l: "специалистов в каталоге",
              },
              { v: "0 ₽", l: "комиссия для клиента · оплата только мастеру" },
              {
                v: (
                  <span className="inline-flex items-center gap-3">
                    <LivePulse />
                    Онлайн
                  </span>
                ),
                l: "бронь свободных окон без перезвонов",
              },
              { v: "AI", l: "подбор специалиста под вашу задачу" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-5xl leading-none tracking-tight text-heading">
                  {s.v}
                </div>
                <div className="small mt-3 max-w-[220px]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
       </CursorGlow>
      </section>

      {/* MARQUEE BAND */}
      <div
        className="overflow-hidden border-y border-line bg-surface py-5"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          maskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span
              key={i}
              className={`inline-flex items-center px-6 font-serif text-3xl tracking-tight sm:text-4xl ${
                i % 3 === 1 ? "italic" : ""
              } ${i % 4 === 0 ? "text-accent" : "text-heading"}`}
            >
              {m}
              <span aria-hidden className="ml-8 text-2xl text-secondary/40">
                ·
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — bento */}
      <section className="container-px border-t border-line py-24">
        <div className="mb-12 grid items-end gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <span className="eyebrow">
              <span className="num-label">01</span> Как это работает
            </span>
            <ScrollBoldHeading className="h1 mt-6">
              Три шага.
              <br />
              Без перезвонов.
            </ScrollBoldHeading>
          </div>
          <p className="body-lg max-w-lg lg:justify-self-end">
            Мы не записываем «на услугу в студию». Мы соединяем вас с конкретным
            человеком — со своим расписанием, своими ценами, своим почерком.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const inner = (
              <div
                className={`flex h-full flex-col justify-between rounded-xl2 border border-line p-9 ${
                  i === 0
                    ? "bg-gradient-to-b from-surface to-card"
                    : i === 2
                      ? "bg-gradient-to-br from-accent to-plum-700 text-white"
                      : "bg-card"
                }`}
              >
                <div>
                  <div
                    className={`num-label text-5xl ${i === 2 ? "!text-white/80" : ""}`}
                  >
                    {s.n}
                  </div>
                  <h3 className="mt-6 font-serif text-3xl">
                    {s.lead}{" "}
                    <em className={i === 2 ? "italic" : "italic hot"}>
                      {s.title}.
                    </em>
                  </h3>
                  <p
                    className={`mt-4 text-sm leading-relaxed ${
                      i === 2 ? "text-white/85" : "text-body"
                    }`}
                  >
                    {s.text}
                  </p>
                </div>
                {i === 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {["наличные", "карта", "СБП", "перевод"].map((p) => (
                      <span key={p} className="chip">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
            return i === 0 ? (
              <Tilt key={s.n} className="md:row-span-2">
                {inner}
              </Tilt>
            ) : (
              <Fragment key={s.n}>{inner}</Fragment>
            );
          })}
        </div>
      </section>

      {/* SPECIALIZATIONS */}
      <section className="bg-gradient-to-b from-surface to-page py-24">
        <div className="container-px grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="eyebrow">
              <span className="num-label">02</span> Выбор по запросу
            </span>
            <ScrollBoldHeading className="h1 mt-6 mb-6">
              Скажите телу,
              <br />
              где болит.
            </ScrollBoldHeading>
            <p className="body-lg mb-8 max-w-md">
              Выберите зону или задачу — увидите специалистов, которые работают
              именно с этим. Можно сразу уточнить технику, формат и район.
            </p>
            <div className="flex flex-col">
              {NEEDS.map((n) => (
                <Link
                  key={n.slug}
                  href={`/therapists/${n.slug}`}
                  className="flex items-center justify-between gap-4 border-b border-line px-4 py-3.5 transition-colors hover:bg-accent-soft"
                >
                  <span className="font-serif text-xl text-heading">
                    {n.label}
                  </span>
                  <span className="small" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="img-ph aspect-[3/4] w-full max-w-sm rounded-xl2">
              карта тела
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-px py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">
              <span className="num-label">03</span> Рекомендуем
            </span>
            <ScrollBoldHeading className="h1 mt-6">
              Мастера, которым
              <br />
              <span className="italic hot">возвращаются.</span>
            </ScrollBoldHeading>
          </div>
          <Link href="/therapists" className="btn-secondary btn-sm">
            Весь каталог →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => {
              const card = <ProfileCard profile={p} />;
              return (
                <HoverCursor
                  key={p.id}
                  label={`→ Записаться к ${p.full_name.split(" ")[0]}`}
                  className="h-full"
                >
                  {i === 1 ? (
                    <Tilt className="h-full">{card}</Tilt>
                  ) : (
                    card
                  )}
                </HoverCursor>
              );
            })}
          </div>
        ) : (
          <p className="body-lg text-secondary">
            Скоро здесь появятся первые специалисты.
          </p>
        )}
      </section>

      {/* PRINCIPLES (editorial) */}
      <section className="container-px py-24">
        <span className="eyebrow">
          <span className="num-label">04</span> Принципы платформы
        </span>
        <ScrollBoldHeading className="h1 mt-6 mb-14 max-w-3xl">
          <span className="italic hot">Только профессиональный</span>{" "}
          оздоровительный и лечебный массаж.
        </ScrollBoldHeading>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAFETY_RULES.slice(0, 6).map((r, i) => (
            <figure
              key={r}
              className={`m-0 flex min-h-[220px] flex-col justify-between rounded-xl2 border p-8 ${
                i === 0
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-card"
              }`}
            >
              <div className="num-label text-5xl leading-none">
                0{i + 1}
              </div>
              <blockquote className="serif m-0 mt-6 text-lg leading-snug text-heading">
                {r}
              </blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-px py-24">
        <div className="relative grid items-center gap-16 overflow-hidden rounded-xl2 bg-gradient-to-br from-accent to-plum-700 px-10 py-20 text-white sm:px-16 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative z-10">
            <span className="eyebrow !text-white/60">Готовы начать?</span>
            <h2 className="mt-6 font-serif text-5xl font-medium leading-none tracking-tight sm:text-6xl">
              Найдите своего
              <br />
              мастера.
              <br />
              <em className="italic opacity-70">Или станьте им.</em>
            </h2>
          </div>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <Magnetic>
              <Link
                href="/therapists"
                className="inline-flex items-center gap-3 rounded-full bg-white px-9 py-5 text-base font-medium text-obsidian-1"
              >
                Найти мастера <span aria-hidden>→</span>
              </Link>
            </Magnetic>
            <Link
              href="/dashboard/profile"
              className="text-sm text-white/70 underline-offset-4 hover:underline"
            >
              Я массажист — завести профиль →
            </Link>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.25), transparent 60%)",
            }}
          />
        </div>
      </section>
    </div>
  );
}
