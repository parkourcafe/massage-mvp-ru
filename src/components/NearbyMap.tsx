"use client";

import { useEffect, useRef, useState } from "react";
import { buildWhatsAppLink } from "@/lib/util";
import type { NearbyCard } from "@/lib/nearby";

// Privacy: this map only ever draws the CLIENT marker and coarse
// AREA markers (public district centroids). It never receives or
// renders a therapist's real coordinates — every therapist in an area
// shares that area's single centroid marker.

type LatLng = [number, number];

interface LLayer {
  addTo(m: LMap): LLayer;
  bindPopup(html: string, opts?: Record<string, unknown>): LLayer;
}
interface LMap {
  setView(center: LatLng, zoom: number): LMap;
  removeLayer(layer: LLayer): void;
  fitBounds(bounds: LatLng[], opts?: Record<string, unknown>): void;
}
interface LeafletApi {
  map(el: HTMLElement, opts?: Record<string, unknown>): LMap;
  tileLayer(url: string, opts?: Record<string, unknown>): LLayer;
  circleMarker(c: LatLng, opts?: Record<string, unknown>): LLayer;
  circle(c: LatLng, opts?: Record<string, unknown>): LLayer;
}

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<LeafletApi | null> {
  const w = window as unknown as { L?: LeafletApi };
  if (w.L) return Promise.resolve(w.L);
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${LEAFLET_JS}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(w.L ?? null));
      existing.addEventListener("error", reject);
      if (w.L) resolve(w.L);
      return;
    }
    const s = document.createElement("script");
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(w.L ?? null);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rub(n: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(n)} ₽`;
}

// One mini profile preview inside an area popup: face + name +
// "verified · experience" (no fabricated stars) + distance + price.
function previewHtml(c: NearbyCard): string {
  const wa = buildWhatsAppLink(
    c.whatsapp,
    `Здравствуйте! Хочу записаться на массаж.\n\nМастер: ${c.full_name}\nЗона: ${c.area_label}\nПлатформа: Massage MVP`
  );
  const photo = c.photo_url
    ? `<img src="${esc(
        c.photo_url
      )}" alt="" style="width:44px;height:44px;border-radius:9999px;object-fit:cover;flex:0 0 auto" />`
    : `<span style="width:44px;height:44px;border-radius:9999px;background:#e7ddcd;flex:0 0 auto;display:inline-block"></span>`;
  const trust = [
    c.verified ? "✓ проверен" : null,
    c.years_experience ? `${c.years_experience} лет опыта` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const dist =
    c.approx_distance_km != null
      ? `≈ ${c.approx_distance_km} км`
      : "обслуживает ваш район";
  const price =
    c.price_from != null ? `от ${rub(c.price_from)}` : "цена по запросу";
  const waBtn = wa
    ? `<a href="${esc(
        wa
      )}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#285b50;color:#fff;border-radius:8px;padding:6px 8px;font-size:12px;text-decoration:none">WhatsApp</a>`
    : "";
  return `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid #e7ddcd">
      ${photo}
      <div style="min-width:0;flex:1">
        <div style="font-weight:600;color:#22201c;font-size:13px">${esc(
          c.full_name
        )}</div>
        <div style="color:#7c766b;font-size:11px;margin-top:1px">${esc(
          trust || "профессиональный массаж"
        )}</div>
        <div style="color:#4a463f;font-size:11px;margin-top:2px">${esc(
          dist
        )} · ${esc(price)}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <a href="/therapist/${esc(
            c.slug
          )}" style="flex:1;text-align:center;border:1px solid #bbdfd2;color:#234943;border-radius:8px;padding:6px 8px;font-size:12px;text-decoration:none">Профиль</a>
          ${waBtn}
        </div>
      </div>
    </div>`;
}

interface AreaGroup {
  label: string;
  lat: number;
  lng: number;
  cards: NearbyCard[];
}

export function NearbyMap({
  client,
  cards,
}: {
  client: { lat: number; lng: number } | null;
  cards: NearbyCard[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let layers: LLayer[] = [];

    // Group therapists by coarse area (centroid). One marker per area.
    const groups = new Map<string, AreaGroup>();
    for (const c of cards) {
      if (!c.area_center) continue;
      const g = groups.get(c.area_label);
      if (g) g.cards.push(c);
      else
        groups.set(c.area_label, {
          label: c.area_label,
          lat: c.area_center.lat,
          lng: c.area_center.lng,
          cards: [c],
        });
    }
    const areaList = Array.from(groups.values());

    loadLeaflet()
      .then((L) => {
        if (cancelled || !ref.current || !L) return;
        const center: LatLng = client
          ? [client.lat, client.lng]
          : areaList[0]
            ? [areaList[0].lat, areaList[0].lng]
            : [55.7522, 37.6156];

        if (!mapRef.current) {
          const map = L.map(ref.current, {
            scrollWheelZoom: false,
            attributionControl: true,
          }).setView(center, client ? 12 : 11);
          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "© OpenStreetMap",
          }).addTo(map);
          mapRef.current = map;
        }
        const map = mapRef.current;
        if (!map) return;

        layers.forEach((l) => map.removeLayer(l));
        layers = [];

        if (client) {
          layers.push(
            L.circleMarker([client.lat, client.lng], {
              radius: 8,
              color: "#285b50",
              fillColor: "#3f8d79",
              fillOpacity: 0.9,
            })
              .addTo(map)
              .bindPopup("Вы здесь")
          );
        }

        for (const a of areaList) {
          const popup = `
            <div style="max-height:280px;overflow:auto;min-width:220px">
              <div style="font-weight:600;font-size:12px;color:#22201c;padding-bottom:2px">
                ${esc(a.label)} · ${a.cards.length} ${
                  a.cards.length === 1 ? "мастер" : "мастеров"
                } сейчас
              </div>
              ${a.cards.map(previewHtml).join("")}
            </div>`;
          // Coarse zone circle.
          layers.push(
            L.circle([a.lat, a.lng], {
              radius: 1100,
              color: "#bd7349",
              weight: 1,
              fillColor: "#cf8a5f",
              fillOpacity: 0.16,
            }).addTo(map)
          );
          // Clickable area marker with the profile previews.
          layers.push(
            L.circleMarker([a.lat, a.lng], {
              radius: 11,
              color: "#a35d38",
              fillColor: "#cf8a5f",
              fillOpacity: 0.95,
            })
              .addTo(map)
              .bindPopup(popup, { maxWidth: 300 })
          );
        }

        const pts: LatLng[] = [
          ...(client ? ([[client.lat, client.lng]] as LatLng[]) : []),
          ...areaList.map((a) => [a.lat, a.lng] as LatLng),
        ];
        if (pts.length > 1) {
          map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [client, cards]);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl2 border border-sand-200 bg-sand-100/60 p-6 text-center text-sm text-ink-muted">
        Карта временно недоступна — список мастеров ниже работает как
        обычно.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-hidden rounded-xl2 border border-sand-200"
      style={{ minHeight: 280 }}
      aria-label="Карта зон, где сейчас доступны мастера"
    />
  );
}
