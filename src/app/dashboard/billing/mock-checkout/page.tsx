"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Simulated YooKassa checkout used only when YooKassa is not configured.
// Pressing "pay" calls the real webhook endpoint server-side, which
// re-verifies and activates the subscription — the redirect alone never
// activates Pro.
function MockCheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const pid = params.get("pid");
  const [status, setStatus] = useState<"idle" | "paying" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!pid) setStatus("error");
  }, [pid]);

  async function confirm(success: boolean) {
    setStatus("paying");
    const res = await fetch("/api/payments/webhook/yookassa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: success ? "payment.succeeded" : "payment.canceled",
        object: { id: pid },
      }),
    });
    if (res.ok) {
      setStatus("done");
      setTimeout(() => {
        router.push("/dashboard/billing?return=1");
        router.refresh();
      }, 800);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="py-16 max-w-md mx-auto text-center">
      <div className="card">
        <div className="-mx-6 -mt-6 mb-6 px-6 py-6 bg-gradient-to-br from-accent to-plum-700 rounded-t-2xl text-left">
          <p className="eyebrow text-white/65">YooKassa</p>
          <h1 className="h2 mt-2 text-white">Тестовая оплата</h1>
        </div>
        <p className="small">
          Демонстрационный экран. Реальная оплата откроется на стороне
          YooKassa при настроенных ключах.
        </p>
        <p className="mt-3 text-xs text-secondary break-all">
          Платёж: <span className="font-serif text-body">{pid}</span>
        </p>
        {status === "done" ? (
          <p className="mt-6 serif text-accent text-lg">
            Оплата подтверждена ✓
          </p>
        ) : status === "error" ? (
          <p className="mt-6 rounded-lg bg-accent-soft border border-line text-accent text-sm px-4 py-3">
            Ошибка платежа
          </p>
        ) : (
          <div className="mt-7 flex gap-2 justify-center">
            <button
              className="btn-primary"
              disabled={status === "paying"}
              onClick={() => confirm(true)}
            >
              Оплатить
            </button>
            <button
              className="btn-ghost"
              disabled={status === "paying"}
              onClick={() => confirm(false)}
            >
              Отменить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockCheckout() {
  return (
    <Suspense fallback={<div className="py-16 text-body">Загрузка…</div>}>
      <MockCheckoutInner />
    </Suspense>
  );
}
