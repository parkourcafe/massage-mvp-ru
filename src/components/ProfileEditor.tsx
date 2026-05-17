"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile, ServiceItem } from "@/lib/types";
import { MODALITIES, modalityLabel } from "@/lib/catalog";

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>(
    profile.services ?? []
  );

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      full_name: fd.get("full_name"),
      headline: fd.get("headline"),
      professional_description: fd.get("professional_description"),
      safety_boundaries: fd.get("safety_boundaries"),
      years_experience: fd.get("years_experience"),
      city: fd.get("city"),
      district: fd.get("district"),
      public_location_label: fd.get("public_location_label"),
      therapist_address_private: fd.get("therapist_address_private"),
      price_from: fd.get("price_from"),
      minimum_booking_price: fd.get("minimum_booking_price"),
      transport_fee: fd.get("transport_fee"),
      show_gender: fd.get("show_gender") === "on",
      works_at_own_place: fd.get("works_at_own_place") === "on",
      travels_to_client: fd.get("travels_to_client") === "on",
      works_in_hotels: fd.get("works_in_hotels") === "on",
      works_in_villas: fd.get("works_in_villas") === "on",
      works_in_salon: fd.get("works_in_salon") === "on",
      is_published: fd.get("is_published") === "on",
      languages: String(fd.get("languages") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      travel_districts: String(fd.get("travel_districts") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    setMsg(
      res.ok
        ? `Сохранено. Качество профиля: ${data.quality_score}/100${
            data.moderation_status === "flagged"
              ? " · профиль отправлен на проверку модерации"
              : ""
          }`
        : data.error || "Ошибка сохранения"
    );
    router.refresh();
  }

  async function addService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modality: fd.get("modality"),
        title: fd.get("title"),
        description: fd.get("description"),
        duration: fd.get("duration"),
        price: fd.get("price"),
        contraindication_note: fd.get("contraindication_note"),
        is_published: true,
      }),
    });
    const data = await res.json();
    if (res.ok && data.service) {
      setServices((s) => [...s, data.service]);
      (e.target as HTMLFormElement).reset();
    }
  }

  async function removeService(id: string) {
    await fetch("/api/dashboard/profile", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setServices((s) => s.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8">
      {msg && (
        <p className="rounded-lg bg-brand-50 text-brand-800 text-sm px-3 py-2">
          {msg}
        </p>
      )}

      <form onSubmit={saveProfile} className="card space-y-4">
        <h2 className="font-semibold">Основная информация</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="full_name" label="Имя" defaultValue={profile.full_name} />
          <Field
            name="headline"
            label="Заголовок"
            defaultValue={profile.headline ?? ""}
          />
          <Field
            name="years_experience"
            label="Опыт (лет)"
            type="number"
            defaultValue={String(profile.years_experience)}
          />
          <Field
            name="price_from"
            label="Цена от (₽)"
            type="number"
            defaultValue={String(profile.price_from ?? "")}
          />
          <Field name="city" label="Город" defaultValue={profile.city ?? ""} />
          <Field
            name="district"
            label="Район"
            defaultValue={profile.district ?? ""}
          />
          <Field
            name="public_location_label"
            label="Публичная локация (без точного адреса)"
            defaultValue={profile.public_location_label ?? ""}
          />
          <Field
            name="therapist_address_private"
            label="Приватный адрес (не публикуется)"
            defaultValue={profile.therapist_address_private ?? ""}
          />
          <Field
            name="minimum_booking_price"
            label="Мин. стоимость (₽)"
            type="number"
            defaultValue={String(profile.minimum_booking_price ?? "")}
          />
          <Field
            name="transport_fee"
            label="Плата за выезд (₽)"
            type="number"
            defaultValue={String(profile.transport_fee ?? "")}
          />
          <Field
            name="languages"
            label="Языки (через запятую)"
            defaultValue={profile.languages.join(", ")}
          />
          <Field
            name="travel_districts"
            label="Районы выезда (через запятую)"
            defaultValue={profile.travel_districts.join(", ")}
          />
        </div>
        <div>
          <label className="label">Описание</label>
          <textarea
            name="professional_description"
            rows={4}
            className="input"
            defaultValue={profile.professional_description ?? ""}
          />
        </div>
        <div>
          <label className="label">
            Профессиональные границы и безопасность
          </label>
          <textarea
            name="safety_boundaries"
            rows={3}
            className="input"
            defaultValue={profile.safety_boundaries ?? ""}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-2 text-sm">
          <Check name="show_gender" label="Показывать пол" defaultChecked={profile.show_gender} />
          <Check name="works_at_own_place" label="Приём у себя" defaultChecked={profile.works_at_own_place} />
          <Check name="travels_to_client" label="Выезд к клиенту" defaultChecked={profile.travels_to_client} />
          <Check name="works_in_hotels" label="Отели" defaultChecked={profile.works_in_hotels} />
          <Check name="works_in_villas" label="Виллы" defaultChecked={profile.works_in_villas} />
          <Check name="works_in_salon" label="Салон / студия" defaultChecked={profile.works_in_salon} />
          <Check name="is_published" label="Опубликован" defaultChecked={profile.is_published} />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </form>

      <div className="card space-y-4">
        <h2 className="font-semibold">Услуги</h2>
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm"
            >
              <span>
                <strong>{s.title}</strong> · {modalityLabel(s.modality)} ·{" "}
                {s.duration ?? "—"} мин · {s.price ?? "—"} ₽
              </span>
              <button
                onClick={() => removeService(s.id)}
                className="text-red-600 text-xs"
              >
                Удалить
              </button>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-slate-500">Услуги не добавлены.</p>
          )}
        </div>
        <form onSubmit={addService} className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Тип</label>
            <select name="modality" className="input">
              {MODALITIES.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Field name="title" label="Название" />
          <Field name="duration" label="Длительность (мин)" type="number" />
          <Field name="price" label="Цена (₽)" type="number" />
          <div className="sm:col-span-2">
            <label className="label">Описание</label>
            <input name="description" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Противопоказания (если есть)</label>
            <input name="contraindication_note" className="input" />
          </div>
          <div>
            <button className="btn-secondary">Добавить услугу</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="input"
      />
    </div>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
