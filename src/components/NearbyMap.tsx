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
  if (!document.getElementById("leaflet-drama")) {
    const st = document.createElement("style");
    st.id = "leaflet-drama";
    st.textContent = `
      .leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#1d1722;color:#ebdfd5;box-shadow:0 18px 60px rgba(0,0,0,.6)}
      .leaflet-popup-content-wrapper{border:1px solid rgba(248,239,232,.12);border-radius:14px}
      .leaflet-popup-content{margin:14px 16px}
      .leaflet-container a.leaflet-popup-close-button{color:#8a7f7a}
      .leaflet-container a.leaflet-popup-close-button:hover{color:#f8efe8}
      .leaflet-bar a,.leaflet-bar a:hover{background:#1d1722;color:#ebdfd5;border-color:rgba(248,239,232,.12)}
    `;
    document.head.appendChild(st);
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
    `Здравствуйте! Хочу записаться на массаж.\n\nМастер: ${c.full_name}\nЗона: ${c.area_label}\nПлатформа: MassageMatch`
  );
  const photo = c.photo_url
    ? `<img src="${esc(
        c.photo_url
      )}" alt="" style="width:44px;height:44px;border-radius:9999px;object-fit:cover;flex:0 0 auto" />`
    : `<span style="width:44px;height:44px;border-radius:9999px;background:#2a2230;flex:0 0 auto;display:inline-block"></span>`;
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
      )}" target="_blank" rel="noopener noreferrer" style="flex:1;text-align:center;background:#ec4889;color:#14101a;border-radius:8px;padding:6px 8px;font-size:12px;text-decoration:none">WhatsApp</a>`
    : "";
  return `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(248,239,232,0.12)">
      ${photo}
      <div style="min-width:0;flex:1">
        <div style="font-weight:600;color:#f8efe8;font-size:13px">${esc(
          c.full_name
        )}</div>
        <div style="color:#8a7f7a;font-size:11px;margin-top:1px">${esc(
          trust || "профессиональный массаж"
        )}</div>
        <div style="color:#ebdfd5;font-size:11px;margin-top:2px">${esc(
          dist
        )} · ${esc(price)}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <a href="/therapist/${esc(
            c.slug
          )}" style="flex:1;text-align:center;border:1px solid rgba(248,239,232,0.22);color:#f8efe8;border-radius:8px;padding:6px 8px;font-size:12px;text-decoration:none">Профиль</a>
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
          L.tileLayer(
            "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            {
              maxZoom: 19,
              attribution: "© OpenStreetMap · © CARTO",
            }
          ).addTo(map);
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
              color: "#d72a6f",
              fillColor: "#ec4889",
              fillOpacity: 0.9,
            })
              .addTo(map)
              .bindPopup("Вы здесь")
          );
        }

        for (const a of areaList) {
          const popup = `
            <div style="max-height:280px;overflow:auto;min-width:220px">
              <div style="font-weight:600;font-size:12px;color:#f8efe8;padding-bottom:2px">
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
              color: "#7d3a78",
              weight: 1,
              fillColor: "#7d3a78",
              fillOpacity: 0.18,
            }).addTo(map)
          );
          // Clickable area marker with the profile previews.
          layers.push(
            L.circleMarker([a.lat, a.lng], {
              radius: 11,
              color: "#d72a6f",
              fillColor: "#ec4889",
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
