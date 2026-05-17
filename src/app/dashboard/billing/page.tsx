"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BillingState = {
  plan: string;
  subscription: { status: string; plan_id: string; expires_at?: string | null } | null;
  proPrice: number;
};

export default function BillingPage() {
  const router = useRouter();
  const [state, setState] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/billing/state");
    setState(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function pay(plan: "pro" | "expert") {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Ошибка создания платежа");
      return;
    }
    window.location.href = data.confirmationUrl;
  }

  async function cancel() {
    setBusy(true);
    await fetch("/api/subscriptions/cancel", { method: "POST" });
    setBusy(false);
    await load();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Подписка</h1>
      <p className="text-sm text-slate-600">
        Pro активируется только после подтверждённой оплаты (проверка на
        стороне сервера через webhook). Оплата клиентом сеансов в MVP не
        реализуется.
      </p>

      {msg && (
        <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
          {msg}
        </p>
      )}

      <div className="card">
        <p className="text-sm text-slate-500">Текущий тариф</p>
        <p className="text-2xl font-bold mt-1">
          {state?.plan?.toUpperCase() ?? "…"}
        </p>
        {state?.subscription && (
          <p className="text-sm text-slate-500 mt-1">
            Статус: {state.subscription.status}
            {state.subscription.expires_at
              ? ` · до ${new Date(
                  state.subscription.expires_at
                ).toLocaleDateString("ru-RU")}`
              : ""}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold">Pro — {state?.proPrice ?? 490} ₽/мес</h2>
          <p className="text-sm text-slate-600 mt-1">
            SEO, медиа, AI-импорт, AI-подбор, заявки, CRM, аналитика,
            поддержка менеджера.
          </p>
          <button
            className="btn-primary mt-4"
            disabled={busy}
            onClick={() => pay("pro")}
          >
            Оплатить Pro
          </button>
        </div>
        <div className="card">
          <h2 className="font-semibold">Expert</h2>
          <p className="text-sm text-slate-600 mt-1">
            Всё из Pro + приоритетное размещение, расширенная аналитика,
            PDF-профиль.
          </p>
          <button
            className="btn-secondary mt-4"
            disabled={busy}
            onClick={() => pay("expert")}
          >
            Оплатить Expert
          </button>
        </div>
      </div>

      {state?.subscription?.status === "active" && (
        <button className="btn-ghost text-red-600" disabled={busy} onClick={cancel}>
          Отменить подписку
        </button>
      )}
    </div>
  );
}
