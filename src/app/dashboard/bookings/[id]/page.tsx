import { notFound } from "next/navigation";
import { getBookingById, getOwnerProfile } from "@/lib/db";
import { BookingThread } from "@/components/BookingThread";
import { modalityLabel } from "@/lib/catalog";
import type { BookingEventType } from "@/lib/types";

type Params = { params: { id: string } };

const EVENT_LABEL: Record<BookingEventType, string> = {
  created: "Заявка создана",
  message: "Сообщение",
  status_change: "Смена статуса",
  time_proposed: "Предложено время",
  confirmed: "Запись подтверждена",
  outcome: "Итог",
  converted_to_client: "Преобразовано в клиента",
};

export default async function BookingDetailPage({ params }: Params) {
  const owner = await getOwnerProfile();
  const booking = await getBookingById(params.id);
  if (!booking || booking.profile_id !== owner.id) notFound();

  const confirmed =
    booking.status === "confirmed" ||
    booking.status === "completed" ||
    booking.status === "converted_to_repeat_client";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Заявка</p>
          <h1 className="h1 mt-3">{booking.client_name}</h1>
        </div>
        <span
          className={`badge ${
            confirmed
              ? "bg-plum-700 text-white"
              : booking.status.includes("cancel") ||
                  booking.status.includes("lost")
                ? "bg-transparent text-mag-300"
                : "bg-accent-soft text-accent"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="card grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <p>
          <span className="eyebrow block mb-1">Услуга</span>
          <span className="text-heading">
            {booking.service_type ? modalityLabel(booking.service_type) : "—"}
          </span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Цель</span>
          <span className="text-heading">{booking.massage_goal ?? "—"}</span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Зона</span>
          <span className="text-heading">{booking.focus_area ?? "—"}</span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Нажим</span>
          <span className="text-heading">
            {booking.pressure_preference ?? "—"}
          </span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Формат</span>
          <span className="text-heading">{booking.location_type ?? "—"}</span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Город / район</span>
          <span className="text-heading">
            {[booking.city, booking.district].filter(Boolean).join(", ") || "—"}
          </span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Способ связи</span>
          <span className="text-heading">
            {booking.contact_method ?? "—"}: {booking.contact_value ?? "—"}
          </span>
        </p>
        <p>
          <span className="eyebrow block mb-1">Адрес/ориентир</span>
          <span className="text-heading">
            {confirmed
              ? booking.address_or_landmark ?? "—"
              : "доступен после подтверждения записи"}
          </span>
        </p>
        <p className="sm:col-span-2">
          <span className="eyebrow block mb-2">Предложенные слоты</span>
          <span className="flex flex-wrap gap-2">
            {[
              booking.preferred_time_slot_1,
              booking.preferred_time_slot_2,
              booking.preferred_time_slot_3,
            ].filter(Boolean).length === 0 ? (
              <span className="text-secondary">—</span>
            ) : (
              [
                booking.preferred_time_slot_1,
                booking.preferred_time_slot_2,
                booking.preferred_time_slot_3,
              ]
                .filter(Boolean)
                .map((slot, i) => (
                  <span key={i} className="chip">
                    {slot}
                  </span>
                ))
            )}
          </span>
        </p>
      </div>

      <BookingThread booking={booking} role="therapist" />

      <div className="card">
        <p className="eyebrow">Лента</p>
        <h2 className="h3 mt-2">История событий</h2>
        <ul className="mt-5 text-xs space-y-3">
          {(booking.events ?? []).map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-baseline gap-x-2 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <span className="num-label not-italic text-secondary">
                {new Date(e.created_at).toLocaleString("ru-RU")}
              </span>
              <span className="text-heading serif">
                {EVENT_LABEL[e.event_type] ?? e.event_type}
              </span>
              {e.event_text ? (
                <span className="text-secondary">— {e.event_text}</span>
              ) : null}
            </li>
          ))}
          {(booking.events ?? []).length === 0 && (
            <li className="text-secondary">Событий пока нет.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
