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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Заявка: {booking.client_name}
      </h1>

      <div className="card grid sm:grid-cols-2 gap-2 text-sm">
        <p>
          <span className="text-slate-500">Услуга:</span>{" "}
          {booking.service_type ? modalityLabel(booking.service_type) : "—"}
        </p>
        <p>
          <span className="text-slate-500">Цель:</span>{" "}
          {booking.massage_goal ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Зона:</span>{" "}
          {booking.focus_area ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Нажим:</span>{" "}
          {booking.pressure_preference ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Формат:</span>{" "}
          {booking.location_type ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Город / район:</span>{" "}
          {[booking.city, booking.district].filter(Boolean).join(", ") || "—"}
        </p>
        <p>
          <span className="text-slate-500">Способ связи:</span>{" "}
          {booking.contact_method ?? "—"}: {booking.contact_value ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Адрес/ориентир:</span>{" "}
          {booking.status === "confirmed" ||
          booking.status === "completed" ||
          booking.status === "converted_to_repeat_client"
            ? booking.address_or_landmark ?? "—"
            : "доступен после подтверждения записи"}
        </p>
        <p className="sm:col-span-2">
          <span className="text-slate-500">Предложенные слоты:</span>{" "}
          {[
            booking.preferred_time_slot_1,
            booking.preferred_time_slot_2,
            booking.preferred_time_slot_3,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
      </div>

      <BookingThread booking={booking} role="therapist" />

      <div className="card">
        <h2 className="font-semibold text-sm">История событий</h2>
        <ul className="mt-2 text-xs text-slate-500 space-y-1">
          {(booking.events ?? []).map((e) => (
            <li key={e.id}>
              {new Date(e.created_at).toLocaleString("ru-RU")} —{" "}
              {EVENT_LABEL[e.event_type] ?? e.event_type}
              {e.event_text ? `: ${e.event_text}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
