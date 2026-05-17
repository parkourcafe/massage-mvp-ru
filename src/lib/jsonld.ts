// JSON-LD (schema.org) builders. Pure functions — no DB access. We do
// NOT emit Review/AggregateRating because there are no public reviews
// (only private mutual feedback + therapist-uploaded screenshots);
// marking up non-visible ratings violates Google/Yandex guidelines.

import type { Profile } from "./types";
import { SITE_NAME, SITE_URL } from "./seo";
import { modalityLabel } from "./catalog";

type JsonLdObject = Record<string, unknown>;

const abs = (path: string) => `${SITE_URL}${path}`;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-RU",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/therapists?q={query}`,
      },
      "query-input": "required name=query",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function therapistJsonLd(p: Profile): JsonLdObject {
  const photo = (p.media ?? []).find((m) => m.type === "profile_photo");
  const offers = (p.services ?? [])
    .filter((s) => s.is_published && (s.price ?? 0) > 0)
    .map((s) => ({
      "@type": "Offer",
      priceCurrency: "RUB",
      price: s.price,
      itemOffered: {
        "@type": "Service",
        name: s.title,
        serviceType: modalityLabel(s.modality),
      },
    }));
  const areaServed = [p.city, p.district].filter(Boolean).join(", ");
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
    name: p.full_name,
    url: abs(`/therapist/${p.slug}`),
    description: p.professional_description ?? p.headline ?? undefined,
    image: photo?.url,
    knowsLanguage: p.languages?.length ? p.languages : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city ?? undefined,
      addressCountry: "RU",
    },
    areaServed: areaServed || undefined,
    makesOffer: offers.length ? offers : undefined,
    priceRange: p.price_from != null ? `от ${p.price_from} ₽` : undefined,
  };
}

export function serviceJsonLd(opts: {
  serviceType: string;
  path: string;
  areaServed?: string;
  description?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: opts.serviceType,
    name: opts.areaServed
      ? `${opts.serviceType} — ${opts.areaServed}`
      : opts.serviceType,
    description: opts.description,
    areaServed: opts.areaServed ?? "Россия",
    url: abs(opts.path),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function itemListJsonLd(opts: {
  name: string;
  path: string;
  profiles: { slug: string; full_name: string }[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: abs(opts.path),
    numberOfItems: opts.profiles.length,
    itemListElement: opts.profiles.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`/therapist/${p.slug}`),
      name: p.full_name,
    })),
  };
}
