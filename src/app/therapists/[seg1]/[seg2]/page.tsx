import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryView } from "@/components/DirectoryView";
import { CITY_BY_SLUG, MODALITY_BY_SLUG } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { MIN_INDEXABLE_RESULTS, pageMetadata } from "@/lib/seo";

// /therapists/[service]/[city]
type Params = { params: { seg1: string; seg2: string } };

function resolve(seg1: string, seg2: string) {
  const modality = MODALITY_BY_SLUG.get(seg1);
  const city = CITY_BY_SLUG.get(seg2);
  if (!modality || !city) return null;
  return { modality, city };
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const r = resolve(params.seg1, params.seg2);
  if (!r) return pageMetadata({ title: "Не найдено", noindex: true });
  const count = (
    await listPublicProfiles({
      modality: r.modality.key,
      city: r.city.label,
    })
  ).length;
  return pageMetadata({
    title: `${r.modality.label} — ${r.city.label}`,
    description: `${r.modality.label} в городе ${r.city.label}: профессиональные массажисты.`,
    path: `/therapists/${params.seg1}/${params.seg2}`,
    noindex: count < MIN_INDEXABLE_RESULTS,
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
      path={`/therapists/${params.seg1}/${params.seg2}`}
      breadcrumb={[
        { name: "Главная", path: "/" },
        { name: "Каталог специалистов", path: "/therapists" },
        {
          name: r.modality.label,
          path: `/therapists/${params.seg1}`,
        },
        {
          name: r.city.label,
          path: `/therapists/${params.seg1}/${params.seg2}`,
        },
      ]}
    />
  );
}
