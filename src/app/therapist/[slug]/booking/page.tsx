import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { BookingForm } from "@/components/BookingForm";

type Params = {
  params: { slug: string };
  searchParams: { intent?: string };
};

export function generateMetadata({ params }: Params): Metadata {
  const p = getPublicProfileBySlug(params.slug);
  return pageMetadata({
    title: p ? `Запись к ${p.full_name}` : "Запись на сеанс",
    path: `/therapist/${params.slug}/booking`,
    noindex: true,
  });
}

export default function BookingPage({ params, searchParams }: Params) {
  const p = getPublicProfileBySlug(params.slug);
  if (!p) notFound();

  const services = (p.services ?? []).map((s) => ({
    modality: s.modality,
    title: s.title,
  }));
  if (services.length === 0)
    services.push({ modality: "classic", title: "Массаж" });

  const isMessage = searchParams.intent === "message";

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">
        {isMessage ? "Написать специалисту" : "Записаться на сеанс"}:{" "}
        {p.full_name}
      </h1>
      <p className="mt-1 text-slate-600">
        Заявка и переписка проходят внутри платформы. Контакты и точный адрес
        не публикуются.
      </p>
      <div className="mt-6 card">
        <BookingForm
          profileId={p.id}
          slug={p.slug}
          services={services}
          defaultMessage={
            isMessage
              ? "Здравствуйте! У меня вопрос по вашим услугам."
              : "Здравствуйте! Хочу записаться на сеанс массажа."
          }
        />
      </div>
    </div>
  );
}
