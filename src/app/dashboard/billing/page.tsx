"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [offerAccepted, setOfferAccepted] = useState(false);

  async function load() {
    const res = await fetch("/api/billing/state");
    setState(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function pay(plan: "pro" | "expert") {
    if (!offerAccepted) {
      setMsg("Подтвердите согласие с офертой и условиями подписки.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, offerAccepted }),
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
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Кабинет · оплата</p>
        <h1 className="h1 mt-3">Подписка</h1>
        <p className="mt-3 text-body body-lg">
          Pro активируется только после подтверждённой оплаты (проверка на
          стороне сервера через webhook). Оплата клиентом сеансов в MVP не
          реализуется.
        </p>
      </div>

      {msg && (
        <p className="rounded-lg bg-accent-soft border border-line text-accent text-sm px-4 py-3">
          {msg}
        </p>
      )}

      <div className="card bg-gradient-to-br from-accent to-plum-700 border-line-strong relative overflow-hidden">
        <p className="eyebrow text-white/65">Текущий тариф</p>
        <p className="serif text-white text-5xl mt-3 leading-none tracking-tight">
          {state?.plan?.toUpperCase() ?? "…"}
        </p>
        {state?.subscription && (
          <p className="text-sm text-white/80 mt-3">
            Статус: {state.subscription.status}
            {state.subscription.expires_at
              ? ` · до ${new Date(
                  state.subscription.expires_at
                ).toLocaleDateString("ru-RU")}`
              : ""}
          </p>
        )}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.16), transparent 60%)",
          }}
        />
      </div>

      <label className="card flex items-start gap-3 text-sm text-body">
        <input
          type="checkbox"
          className="mt-1"
          checked={offerAccepted}
          onChange={(e) => setOfferAccepted(e.target.checked)}
        />
        <span>
          Я принимаю{" "}
          <Link className="text-accent underline" href="/offer" target="_blank">
            публичную оферту
          </Link>
          ,{" "}
          <Link
            className="text-accent underline"
            href="/subscription-terms"
            target="_blank"
          >
            условия подписки
          </Link>{" "}
          и{" "}
          <Link className="text-accent underline" href="/terms" target="_blank">
            пользовательское соглашение
          </Link>
          .
        </span>
      </label>

      <section>
        <h2 className="h2 mb-5">Тарифы</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card flex flex-col bg-accent-soft border-line-strong">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Pro</p>
              <span className="chip-brand">Популярный</span>
            </div>
            <h3 className="serif text-heading text-4xl mt-3 tracking-tight">
              {state?.proPrice ?? 490} ₽
              <span className="text-secondary text-base font-normal not-italic">
                {" "}
                / мес
              </span>
            </h3>
            <p className="small mt-3 flex-1">
              SEO, медиа, AI-импорт, AI-подбор, заявки, CRM, аналитика,
              поддержка менеджера.
            </p>
            <button
              className="btn-primary mt-6"
              disabled={busy || !offerAccepted}
              onClick={() => pay("pro")}
            >
              Оплатить Pro
            </button>
          </div>
          <div className="card flex flex-col">
            <p className="eyebrow">Expert</p>
            <h3 className="serif text-heading text-4xl mt-3 tracking-tight">
              Максимум
            </h3>
            <p className="small mt-3 flex-1">
              Всё из Pro + приоритетное размещение, расширенная аналитика,
              PDF-профиль.
            </p>
            <button
              className="btn-secondary mt-6"
              disabled={busy || !offerAccepted}
              onClick={() => pay("expert")}
            >
              Оплатить Expert
            </button>
          </div>
        </div>
      </section>

      {state?.subscription?.status === "active" && (
        <button
          className="btn-ghost text-accent"
          disabled={busy}
          onClick={cancel}
        >
          Отменить подписку
        </button>
      )}
    </div>
  );
}
