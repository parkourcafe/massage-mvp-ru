import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfileBySlug, listOpenSlots } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { formatSlot } from "@/lib/util";
import { BookingForm } from "@/components/BookingForm";

type Params = {
  params: { slug: string };
  searchParams: { intent?: string; slot?: string };
};

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const p = await getPublicProfileBySlug(params.slug);
  return pageMetadata({
    title: p ? `Запись к ${p.full_name}` : "Запись на сеанс",
    path: `/therapist/${params.slug}/booking`,
    noindex: true,
  });
}

export default async function BookingPage({ params, searchParams }: Params) {
  const p = await getPublicProfileBySlug(params.slug);
  if (!p) notFound();

  const services = (p.services ?? []).map((s) => ({
    modality: s.modality,
    title: s.title,
  }));
  if (services.length === 0)
    services.push({ modality: "classic", title: "Массаж" });

  const isMessage = searchParams.intent === "message";
  const slots = (await listOpenSlots(p.id)).map((s) => ({
    id: s.id,
    label: formatSlot(s.starts_at),
  }));
  const preselectedSlotId =
    searchParams.slot && slots.some((s) => s.id === searchParams.slot)
      ? searchParams.slot
      : undefined;

  const steps = isMessage
    ? ["Сообщение", "О себе", "Отправка"]
    : ["О сеансе", "Время", "Отправка"];

  return (
    <div className="bg-page">
      <div className="container-px pt-12 sm:pt-16 pb-8">
        <span className="eyebrow">
          {isMessage ? "Сообщение специалисту" : "Онлайн-запись"}
        </span>
        <h1 className="h1 mt-5">
          {isMessage ? "Напишите специалисту" : "Запишитесь за пару шагов"}.
        </h1>
        <p className="body-lg mt-4 max-w-xl">
          {p.full_name}. Заявка и переписка проходят внутри платформы.
          Контакты и точный адрес не публикуются.
        </p>
      </div>

      <div className="border-y border-line">
        <div className="container-px py-6">
          <ol className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {steps.map((label, i) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-strong">
                  <span className="num-label text-base">{`0${i + 1}`}</span>
                </span>
                <span>
                  <span className="eyebrow block">{`Шаг ${i + 1}`}</span>
                  <span className="serif text-heading text-lg">{label}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="container-px py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-start">
          <div className="card">
            <BookingForm
              profileId={p.id}
              slug={p.slug}
              services={services}
              slots={slots}
              preselectedSlotId={preselectedSlotId}
              defaultMessage={
                isMessage
                  ? "Здравствуйте! У меня вопрос по вашим услугам."
                  : "Здравствуйте! Хочу записаться на сеанс массажа."
              }
            />
          </div>

          <aside className="card lg:sticky lg:top-24">
            <span className="eyebrow">Ваш сеанс</span>
            <h3 className="h3 mt-4">{p.full_name}</h3>
            <p className="small mt-2">
              {isMessage
                ? "Задайте вопрос — специалист ответит во внутренней переписке."
                : "Заполните заявку, и специалист подтвердит удобное время."}
            </p>
            <hr className="rule my-6" />
            <ul className="space-y-3">
              {services.slice(0, 4).map((s) => (
                <li
                  key={s.modality}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="small">{s.title}</span>
                  <span className="serif text-heading text-sm">
                    {s.modality}
                  </span>
                </li>
              ))}
            </ul>
            <hr className="rule my-6" />
            <p className="small">
              Оплата и детали согласуются со специалистом во внутренней
              переписке. Точный адрес виден только после подтверждения.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
