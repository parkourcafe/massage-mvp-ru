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

export default function ClientBookingPage({ params }: Params) {
  const booking = getBookingByToken(params.token);
  if (!booking) notFound();
  const therapist = getRawProfileById(booking.profile_id);

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">
        Ваша заявка к специалисту: {therapist?.full_name ?? ""}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Это ваша личная защищённая страница. Не передавайте ссылку третьим
        лицам. Страница не индексируется.
      </p>

      <div className="mt-4 card text-sm grid sm:grid-cols-2 gap-2">
        <p>
          <span className="text-slate-500">Услуга:</span>{" "}
          {booking.service_type ? modalityLabel(booking.service_type) : "—"}
        </p>
        <p>
          <span className="text-slate-500">Длительность:</span>{" "}
          {booking.duration ?? "—"} мин
        </p>
        <p>
          <span className="text-slate-500">Формат:</span>{" "}
          {booking.location_type ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Город / район:</span>{" "}
          {[booking.city, booking.district].filter(Boolean).join(", ") || "—"}
        </p>
      </div>

      <div className="mt-6">
        <BookingThread booking={booking} role="client" />
      </div>
    </div>
  );
}
