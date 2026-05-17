import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryView } from "@/components/DirectoryView";
import { CITY_BY_SLUG, MODALITY_BY_SLUG } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// /therapists/[service]  OR  /therapists/[city]
// A single dynamic segment is required because Next.js cannot have two
// sibling dynamic segments ([service] and [city]); we resolve which one
// it is from the catalog.
type Params = { params: { seg1: string } };

function resolve(seg1: string) {
  const modality = MODALITY_BY_SLUG.get(seg1);
  if (modality) return { kind: "modality" as const, modality };
  const city = CITY_BY_SLUG.get(seg1);
  if (city) return { kind: "city" as const, city };
  return null;
}

export function generateMetadata({ params }: Params): Metadata {
  const r = resolve(params.seg1);
  if (!r) return pageMetadata({ title: "Не найдено", noindex: true });
  if (r.kind === "modality") {
    return pageMetadata({
      title: `${r.modality.label} — массажисты`,
      description: `Профессиональные специалисты: ${r.modality.label}.`,
      path: `/therapists/${params.seg1}`,
    });
  }
  return pageMetadata({
    title: `Массажисты — ${r.city.label}`,
    description: `Профессиональные массажисты в городе ${r.city.label}.`,
    path: `/therapists/${params.seg1}`,
  });
}

export default function TherapistsFilterPage({ params }: Params) {
  const r = resolve(params.seg1);
  if (!r) notFound();

  if (r.kind === "modality") {
    return (
      <DirectoryView
        title={`${r.modality.label}`}
        subtitle="Профессиональные специалисты данного направления"
        filter={{ modality: r.modality.key }}
      />
    );
  }
  return (
    <DirectoryView
      title={`Массажисты — ${r.city.label}`}
      subtitle="Профессиональные специалисты в вашем городе"
      filter={{ city: r.city.label }}
    />
  );
}
