// Lightweight analytics scaffold. Fires events to Yandex.Metrica and GA4
// when their snippets are present; otherwise a no-op. Safe to call from any
// client component. Connect by setting NEXT_PUBLIC_YM_ID / NEXT_PUBLIC_GA_ID
// and loading the respective tag.

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const ymId = process.env.NEXT_PUBLIC_YM_ID;
  if (window.ym && ymId) window.ym(Number(ymId), "reachGoal", name, params);
  if (window.gtag) window.gtag("event", name, params);
}
