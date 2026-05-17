import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryView } from "@/components/DirectoryView";
import { CITY_BY_SLUG, MODALITY_BY_SLUG } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// /therapists/[service]/[city]
type Params = { params: { seg1: string; seg2: string } };

function resolve(seg1: string, seg2: string) {
  const modality = MODALITY_BY_SLUG.get(seg1);
  const city = CITY_BY_SLUG.get(seg2);
  if (!modality || !city) return null;
  return { modality, city };
}

export function generateMetadata({ params }: Params): Metadata {
  const r = resolve(params.seg1, params.seg2);
  if (!r) return pageMetadata({ title: "Не найдено", noindex: true });
  return pageMetadata({
    title: `${r.modality.label} — ${r.city.label}`,
    description: `${r.modality.label} в городе ${r.city.label}: профессиональные массажисты.`,
    path: `/therapists/${params.seg1}/${params.seg2}`,
  });
}

export default function TherapistsServiceCityPage({ params }: Params) {
  const r = resolve(params.seg1, params.seg2);
  if (!r) notFound();
  return (
    <DirectoryView
      title={`${r.modality.label} — ${r.city.label}`}
      subtitle="Профессиональные специалисты данного направления в вашем городе"
      filter={{ modality: r.modality.key, city: r.city.label }}
    />
  );
}
