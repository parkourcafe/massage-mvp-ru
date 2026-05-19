"use client";

import { useEffect, useRef, useState } from "react";

// Privacy: this map only ever draws the CLIENT marker and coarse
// AREA circles (public district centroids). It never receives or
// renders a therapist's real coordinates.

export interface MapArea {
  key: string;
  label: string;
  lat: number;
  lng: number;
  count: number;
}

type LatLng = [number, number];

interface LLayer {
  addTo(m: LMap): LLayer;
  bindPopup(html: string): LLayer;
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

export function NearbyMap({
  client,
  areas,
}: {
  client: { lat: number; lng: number } | null;
  areas: MapArea[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let layers: LLayer[] = [];

    loadLeaflet()
      .then((L) => {
        if (cancelled || !ref.current || !L) return;
        const center: LatLng = client
          ? [client.lat, client.lng]
          : areas[0]
            ? [areas[0].lat, areas[0].lng]
            : [55.7522, 37.6156]; // Moscow center fallback

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

        for (const a of areas) {
          // Area-level circle only — coarse service zone, not a pin.
          layers.push(
            L.circle([a.lat, a.lng], {
              radius: 1100,
              color: "#bd7349",
              weight: 1,
              fillColor: "#cf8a5f",
              fillOpacity: 0.18,
            })
              .addTo(map)
              .bindPopup(
                `${a.label}: ${a.count} ${
                  a.count === 1 ? "мастер" : "мастеров"
                } сейчас`
              )
          );
        }

        const pts: LatLng[] = [
          ...(client
            ? ([[client.lat, client.lng]] as LatLng[])
            : []),
          ...areas.map((a) => [a.lat, a.lng] as LatLng),
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
  }, [client, areas]);

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
