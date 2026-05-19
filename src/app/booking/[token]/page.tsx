import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookingByToken, getRawProfileById } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { BookingThread } from "@/components/BookingThread";
import { modalityLabel } from "@/lib/catalog";

type Params = { params: { token: string } };

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Ваша запись", noindex: true });
}

export default async function ClientBookingPage({ params }: Params) {
  const booking = await getBookingByToken(params.token);
  if (!booking) notFound();
  const therapist = await getRawProfileById(booking.profile_id);

  return (
    <div className="bg-page">
      <div className="container-px pt-12 sm:pt-16 pb-8">
        <span className="eyebrow">Ваша запись</span>
        <h1 className="h1 mt-5">
          Заявка к {therapist?.full_name ?? "специалисту"}.
        </h1>
        <p className="small mt-4 max-w-xl">
          Это ваша личная защищённая страница. Не передавайте ссылку третьим
          лицам. Страница не индексируется.
        </p>
      </div>

      <div className="container-px pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-start">
          <div className="order-2 lg:order-1">
            <BookingThread booking={booking} role="client" />
          </div>

          <aside className="order-1 lg:order-2 card lg:sticky lg:top-24">
            <span className="eyebrow">Ваш сеанс</span>
            <h3 className="h3 mt-4">
              {booking.service_type
                ? modalityLabel(booking.service_type)
                : "Сеанс массажа"}
            </h3>
            <hr className="rule my-6" />
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span className="small">Услуга</span>
                <span className="serif text-heading text-base">
                  {booking.service_type
                    ? modalityLabel(booking.service_type)
                    : "—"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span className="small">Длительность</span>
                <span className="serif text-heading text-base">
                  {booking.duration ?? "—"} мин
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span className="small">Формат</span>
                <span className="serif text-heading text-base">
                  {booking.location_type ?? "—"}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <span className="small">Город / район</span>
                <span className="serif text-heading text-base">
                  {[booking.city, booking.district]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </span>
              </div>
            </div>
            <hr className="rule my-6" />
            <p className="small">
              Детали и точный адрес согласуются со специалистом во внутренней
              переписке ниже.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
