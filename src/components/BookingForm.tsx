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
  defaultMessage,
}: {
  profileId: string;
  slug: string;
  services: { modality: string; title: string }[];
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
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {error}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
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
          <select name="contact_method" className="input" defaultValue="Telegram">
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
      </div>
      <div>
        <label className="label">Адрес или ориентир</label>
        <input name="address_or_landmark" className="input" />
        <p className="text-xs text-slate-500 mt-1">
          Точный адрес виден специалисту только после подтверждения записи и
          никогда не публикуется.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Удобное время 1</label>
          <input name="preferred_time_slot_1" className="input" placeholder="20.05 18:00" />
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
      <p className="text-xs text-slate-500">
        Отправляя заявку, вы соглашаетесь, что платформа предназначена только
        для профессионального оздоровительного и лечебного массажа.
      </p>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Отправка…" : "Отправить заявку"}
      </button>
    </form>
  );
}
