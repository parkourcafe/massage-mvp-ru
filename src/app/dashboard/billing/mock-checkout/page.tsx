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
    <div className="container-px py-16 max-w-md text-center">
      <div className="card">
        <h1 className="text-xl font-bold">Тестовая оплата (YooKassa)</h1>
        <p className="mt-2 text-sm text-slate-600">
          Демонстрационный экран. Реальная оплата откроется на стороне
          YooKassa при настроенных ключах.
        </p>
        <p className="mt-1 text-xs text-slate-400 break-all">Платёж: {pid}</p>
        {status === "done" ? (
          <p className="mt-4 text-emerald-700">Оплата подтверждена ✓</p>
        ) : status === "error" ? (
          <p className="mt-4 text-red-600">Ошибка платежа</p>
        ) : (
          <div className="mt-6 flex gap-2 justify-center">
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
    <Suspense fallback={<div className="container-px py-16">Загрузка…</div>}>
      <MockCheckoutInner />
    </Suspense>
  );
}
