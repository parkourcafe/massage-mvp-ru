"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types";

type Role = "client" | "therapist";

export function BookingThread({
  booking,
  role,
}: {
  booking: Booking;
  role: Role;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState("");
  const [slot, setSlot] = useState("");

  const ref =
    role === "client" ? { token: booking.token } : { id: booking.id };

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    try {
      const res = await fetch("/api/booking-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ref, role, action, ...extra }),
      });
      if (res.ok) {
        setReply("");
        setSlot("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const messages = booking.messages ?? [];

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="badge bg-slate-100 text-slate-700">
            Статус: {booking.status}
          </span>
          {booking.outcome && (
            <span className="badge bg-amber-100 text-amber-800">
              Итог: {booking.outcome}
            </span>
          )}
          {booking.confirmed_time_slot && (
            <span className="badge bg-emerald-100 text-emerald-800">
              Подтверждено: {booking.confirmed_time_slot}
            </span>
          )}
        </div>
      </div>

      <div className="card space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">Сообщений пока нет.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_type === role;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                mine
                  ? "ml-auto bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <p className="text-xs opacity-70 mb-0.5">
                {m.sender_name ||
                  (m.sender_type === "therapist" ? "Специалист" : "Клиент")}
              </p>
              {m.body}
            </div>
          );
        })}
      </div>

      <div className="card space-y-2">
        <textarea
          className="input"
          rows={2}
          placeholder="Сообщение…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          className="btn-primary"
          disabled={busy || !reply.trim()}
          onClick={() => act("message", { body: reply })}
        >
          Отправить
        </button>
      </div>

      <div className="card space-y-2">
        <label className="label">Предложить / подтвердить время</label>
        <input
          className="input"
          placeholder="20.05 18:00"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            disabled={busy || !slot.trim()}
            onClick={() => act("propose_time", { slot })}
          >
            Предложить время
          </button>
          {role === "therapist" && (
            <button
              className="btn-primary"
              disabled={busy || !slot.trim()}
              onClick={() => act("confirm_time", { slot })}
            >
              Подтвердить запись
            </button>
          )}
          {role === "client" && booking.preferred_time_slot_1 && (
            <button
              className="btn-primary"
              disabled={busy}
              onClick={() =>
                act("confirm_time", {
                  slot: slot || booking.preferred_time_slot_1,
                })
              }
            >
              Подтвердить предложенное время
            </button>
          )}
        </div>
      </div>

      <div className="card flex flex-wrap gap-2">
        {role === "therapist" && (
          <>
            <button
              className="btn-secondary"
              disabled={busy}
              onClick={() =>
                act("set_outcome", {
                  outcome: "completed_good",
                  status: "completed",
                })
              }
            >
              Сеанс состоялся
            </button>
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() =>
                act("set_outcome", { outcome: "no_show", status: "no_show" })
              }
            >
              Не пришёл
            </button>
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() =>
                act("set_outcome", {
                  outcome: "lost_no_reply",
                  status: "lost",
                })
              }
            >
              Потерян
            </button>
            <button
              className="btn-ghost"
              disabled={busy}
              onClick={() =>
                act("set_outcome", {
                  outcome: "cancelled_by_therapist",
                  status: "cancelled",
                })
              }
            >
              Отменить
            </button>
            <button
              className="btn-primary"
              disabled={busy}
              onClick={() => act("convert_client")}
            >
              Преобразовать в клиента
            </button>
          </>
        )}
        {role === "client" && (
          <button
            className="btn-ghost"
            disabled={busy}
            onClick={() =>
              act("set_outcome", {
                outcome: "cancelled_by_client",
                status: "cancelled",
              })
            }
          >
            Отменить запись
          </button>
        )}
      </div>
    </div>
  );
}
