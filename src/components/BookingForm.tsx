"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONTACT_METHODS,
  LOCATION_TYPES,
  PRESSURE_OPTIONS,
} from "@/lib/catalog";

export function BookingForm({
  profileId,
  slug,
  services,
  slots = [],
  preselectedSlotId,
  defaultMessage,
}: {
  profileId: string;
  slug: string;
  services: { modality: string; title: string }[];
  slots?: { id: string; label: string }[];
  preselectedSlotId?: string;
  defaultMessage?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.slot_id) delete payload.slot_id;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, profile_id: profileId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось отправить заявку");
        setSubmitting(false);
        return;
      }
      router.push(`/booking/${data.token}`);
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {error && (
        <p className="rounded-[var(--r-control)] bg-accent-soft text-accent text-sm px-4 py-3">
          {error}
        </p>
      )}

      {slots.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline gap-3">
            <span className="num-label text-2xl">01</span>
            <div>
              <span className="eyebrow">Шаг первый</span>
              <h2 className="h3 mt-1">Свободное время</h2>
            </div>
          </div>
          <div className="surface space-y-3">
            <label className="label">Свободное время (бронь сразу)</label>
            <select
              name="slot_id"
              className="input"
              defaultValue={preselectedSlotId ?? ""}
            >
              <option value="">
                Без конкретного времени — предложу удобные ниже
              </option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="small">
              Если выбрать слот, запись подтвердится сразу. Иначе специалист
              ответит и согласует время.
            </p>
          </div>
        </section>
      )}

      <section className="space-y-5">
        <div className="flex items-baseline gap-3">
          <span className="num-label text-2xl">
            {slots.length > 0 ? "02" : "01"}
          </span>
          <div>
            <span className="eyebrow">О сеансе</span>
            <h2 className="h3 mt-1">Что и для кого</h2>
          </div>
        </div>
        <div className="surface grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Ваше имя *</label>
            <input name="client_name" required className="input" />
          </div>
          <div>
            <label className="label">Для кого</label>
            <select name="client_role" className="input" defaultValue="self">
              <option value="self">Для себя</option>
              <option value="for_partner">Для партнёра</option>
              <option value="for_family_member">Для члена семьи</option>
            </select>
          </div>
          <div>
            <label className="label">Способ связи</label>
            <select
              name="contact_method"
              className="input"
              defaultValue="Telegram"
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Контакт</label>
            <input
              name="contact_value"
              className="input"
              placeholder="@username / телефон"
            />
          </div>
          <div>
            <label className="label">Вид массажа</label>
            <select name="service_type" className="input">
              {services.map((s) => (
                <option key={s.modality} value={s.modality}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Длительность (мин)</label>
            <input
              name="duration"
              type="number"
              min={30}
              step={15}
              defaultValue={60}
              className="input"
            />
          </div>
          <div>
            <label className="label">Цель / запрос</label>
            <input name="massage_goal" className="input" />
          </div>
          <div>
            <label className="label">Зона внимания</label>
            <input name="focus_area" className="input" />
          </div>
          <div>
            <label className="label">Предпочтение по нажиму</label>
            <select name="pressure_preference" className="input">
              {PRESSURE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Формат сеанса</label>
            <select name="location_type" className="input">
              {LOCATION_TYPES.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Город</label>
            <input name="city" className="input" />
          </div>
          <div>
            <label className="label">Район</label>
            <input name="district" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Адрес или ориентир</label>
            <input name="address_or_landmark" className="input" />
            <p className="small mt-1.5">
              Точный адрес виден специалисту только после подтверждения записи
              и никогда не публикуется.
            </p>
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="space-y-5">
        <div className="flex items-baseline gap-3">
          <span className="num-label text-2xl">
            {slots.length > 0 ? "03" : "02"}
          </span>
          <div>
            <span className="eyebrow">Когда удобно</span>
            <h2 className="h3 mt-1">Удобное время</h2>
          </div>
        </div>
        <div className="surface space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="label">Удобное время 1</label>
              <input
                name="preferred_time_slot_1"
                className="input"
                placeholder="20.05 18:00"
              />
            </div>
            <div>
              <label className="label">Удобное время 2</label>
              <input name="preferred_time_slot_2" className="input" />
            </div>
            <div>
              <label className="label">Удобное время 3</label>
              <input name="preferred_time_slot_3" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Важные примечания</label>
            <input name="important_notes" className="input" />
          </div>
          <div>
            <label className="label">Сообщение специалисту *</label>
            <textarea
              name="first_message"
              required
              rows={3}
              className="input"
              defaultValue={defaultMessage}
            />
          </div>
        </div>
      </section>

      <div className="space-y-4 border-t border-line pt-6">
        <p className="small">
          Отправляя заявку, вы соглашаетесь, что платформа предназначена только
          для профессионального оздоровительного и лечебного массажа.
        </p>
        <button
          type="submit"
          className="btn-primary btn-lg"
          disabled={submitting}
        >
          {submitting ? "Отправка…" : "Отправить заявку"}
        </button>
      </div>
    </form>
  );
}
