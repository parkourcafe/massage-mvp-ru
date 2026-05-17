"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ClientPrivateFeedback,
  CrmClient,
  TherapistPrivateNote,
} from "@/lib/types";
import { modalityLabel } from "@/lib/catalog";

const PRESSURE_FIT_LABEL: Record<string, string> = {
  too_soft: "слабый",
  good: "в самый раз",
  too_strong: "сильный",
};
const REPEAT_LABEL: Record<string, string> = {
  repeat: "хочет повторить",
  not_sure: "пока думает",
  no: "не хочет",
};

export function ClientDetail({
  client,
  notes = [],
  feedback = [],
  siteUrl = "",
}: {
  client: CrmClient;
  notes?: TherapistPrivateNote[];
  feedback?: ClientPrivateFeedback[];
  siteUrl?: string;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const feedbackUrl = client.token ? `${siteUrl}/client/${client.token}` : null;

  async function saveClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: client.id,
        repeat_status: fd.get("repeat_status"),
        important_notes: fd.get("important_notes"),
        contraindication_notes: fd.get("contraindication_notes"),
      }),
    });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
    router.refresh();
  }

  async function addSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client.id,
        ...Object.fromEntries(fd.entries()),
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  async function addNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/private-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client.id,
        ...Object.fromEntries(
          [...fd.entries()].filter(([, v]) => v !== "")
        ),
      }),
    });
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setMsg("Приватная оценка сохранена");
      router.refresh();
    } else {
      setMsg("Ошибка сохранения оценки");
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p className="rounded-lg bg-brand-50 text-brand-800 text-sm px-3 py-2">
          {msg}
        </p>
      )}

      <div className="card text-sm grid sm:grid-cols-2 gap-2">
        <p>
          <span className="text-slate-500">Контакт:</span>{" "}
          {client.contact_method ?? "—"}: {client.contact_value ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">Город/район:</span>{" "}
          {[client.city, client.district].filter(Boolean).join(", ") || "—"}
        </p>
        <p>
          <span className="text-slate-500">Любимая услуга:</span>{" "}
          {client.preferred_service_type
            ? modalityLabel(client.preferred_service_type)
            : "—"}
        </p>
        <p>
          <span className="text-slate-500">Любимая длительность:</span>{" "}
          {client.favorite_duration ?? "—"} мин
        </p>
      </div>

      {feedbackUrl && (
        <div className="card space-y-2">
          <h2 className="font-semibold">Ссылка для обратной связи клиента</h2>
          <p className="text-xs text-slate-500">
            Отправьте клиенту эту приватную ссылку после сеанса. Его отзыв
            видите только вы и он сам — на сайте ничего не публикуется.
          </p>
          <div className="flex gap-2">
            <input className="input" readOnly value={feedbackUrl} />
            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              onClick={() => {
                navigator.clipboard?.writeText(feedbackUrl);
                setCopied(true);
              }}
            >
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={saveClient} className="card space-y-3">
        <h2 className="font-semibold">Карточка клиента</h2>
        <div>
          <label className="label">Статус</label>
          <select
            name="repeat_status"
            className="input"
            defaultValue={client.repeat_status}
          >
            {["active", "repeat", "paused", "inactive", "lost"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Важные примечания</label>
          <textarea
            name="important_notes"
            rows={2}
            className="input"
            defaultValue={client.important_notes ?? ""}
          />
        </div>
        <div>
          <label className="label">
            Примечания о противопоказаниях (без диагнозов)
          </label>
          <textarea
            name="contraindication_notes"
            rows={2}
            className="input"
            defaultValue={client.contraindication_notes ?? ""}
          />
          <p className="text-xs text-slate-500 mt-1">
            Не храните медицинские диагнозы. Это не медицинская консультация.
          </p>
        </div>
        <button className="btn-primary">Сохранить</button>
      </form>

      <form onSubmit={addNote} className="card space-y-3">
        <h2 className="font-semibold">Приватная оценка клиента</h2>
        <p className="text-xs text-slate-500">
          Эти заметки видите <strong>только вы</strong>. Они не публикуются
          на сайте и не видны клиенту.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Дата сеанса</label>
            <input name="session_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">Использованный нажим</label>
            <input name="pressure_used" className="input" />
          </div>
          <div>
            <label className="label">Зона внимания</label>
            <input name="focus_area" className="input" />
          </div>
          <div>
            <label className="label">Следующий шаг</label>
            <input name="next_step" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Как прошёл сеанс</label>
          <textarea name="how_session_went" rows={2} className="input" />
        </div>
        <div>
          <label className="label">Что повторить</label>
          <textarea name="what_to_repeat" rows={2} className="input" />
        </div>
        <div>
          <label className="label">Чего избегать</label>
          <textarea name="what_to_avoid" rows={2} className="input" />
        </div>
        <div>
          <label className="label">Приватная заметка</label>
          <textarea name="private_note" rows={2} className="input" />
        </div>
        <button className="btn-secondary">Сохранить приватную оценку</button>
      </form>

      {notes.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold">
            Мои приватные заметки ({notes.length})
          </h2>
          {notes.map((n) => (
            <div key={n.id} className="border rounded-lg px-3 py-2 text-sm">
              <p className="font-medium">
                {n.session_date ?? "—"}
                {n.focus_area ? ` · ${n.focus_area}` : ""}
                {n.pressure_used ? ` · нажим: ${n.pressure_used}` : ""}
              </p>
              {n.how_session_went && (
                <p className="text-slate-600">Ход: {n.how_session_went}</p>
              )}
              {n.what_to_repeat && (
                <p className="text-slate-600">
                  Повторить: {n.what_to_repeat}
                </p>
              )}
              {n.what_to_avoid && (
                <p className="text-slate-600">
                  Избегать: {n.what_to_avoid}
                </p>
              )}
              {n.next_step && (
                <p className="text-slate-600">Дальше: {n.next_step}</p>
              )}
              {n.private_note && (
                <p className="text-slate-600">Заметка: {n.private_note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="font-semibold">
          Обратная связь от клиента ({feedback.length})
        </h2>
        <p className="text-xs text-slate-500">
          Приходит с приватной страницы клиента. Не публикуется на сайте.
        </p>
        {feedback.length === 0 && (
          <p className="text-sm text-slate-500">Отзывов пока нет.</p>
        )}
        {feedback.map((f) => (
          <div key={f.id} className="border rounded-lg px-3 py-2 text-sm">
            <p className="font-medium">
              {f.created_at.slice(0, 10)} · комфорт {f.comfort_score ?? "—"}/5
              · профессионализм {f.professionalism_score ?? "—"}/5 · чистота{" "}
              {f.cleanliness_score ?? "—"}/5 · пунктуальность{" "}
              {f.punctuality_score ?? "—"}/5
            </p>
            <p className="text-slate-600">
              Нажим:{" "}
              {f.pressure_fit ? PRESSURE_FIT_LABEL[f.pressure_fit] : "—"} ·
              Продолжать:{" "}
              {f.repeat_status ? REPEAT_LABEL[f.repeat_status] : "—"}
            </p>
            {f.comment && (
              <p className="text-slate-600">Комментарий: {f.comment}</p>
            )}
          </div>
        ))}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">История сеансов</h2>
        {(client.sessions ?? []).length === 0 && (
          <p className="text-sm text-slate-500">Сеансов пока нет.</p>
        )}
        {(client.sessions ?? []).map((s) => (
          <div key={s.id} className="border rounded-lg px-3 py-2 text-sm">
            <p className="font-medium">
              {s.session_date} ·{" "}
              {s.service_type ? modalityLabel(s.service_type) : "—"} ·{" "}
              {s.duration ?? "—"} мин
            </p>
            <p className="text-slate-600">Зона: {s.focus_area ?? "—"}</p>
            <p className="text-slate-600">
              Приватная заметка: {s.private_note ?? "—"}
            </p>
            <p className="text-slate-600">
              Рекомендация: {s.next_recommendation ?? "—"}
            </p>
          </div>
        ))}

        <form
          onSubmit={addSession}
          className="grid sm:grid-cols-2 gap-3 pt-2 border-t"
        >
          <div>
            <label className="label">Дата</label>
            <input name="session_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">Услуга (ключ)</label>
            <input name="service_type" className="input" placeholder="classic" />
          </div>
          <div>
            <label className="label">Длительность</label>
            <input name="duration" type="number" className="input" />
          </div>
          <div>
            <label className="label">Нажим</label>
            <input name="pressure" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Зона внимания</label>
            <input name="focus_area" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Приватная заметка (только для вас)</label>
            <textarea name="private_note" rows={2} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Что повторить / следующий шаг</label>
            <input name="next_recommendation" className="input" />
          </div>
          <div>
            <button className="btn-secondary">Добавить сеанс</button>
          </div>
        </form>
      </div>
    </div>
  );
}
