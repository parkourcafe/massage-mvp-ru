import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DirectoryView } from "@/components/DirectoryView";
import { CITY_BY_SLUG, MODALITY_BY_SLUG } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { landingContent } from "@/lib/landing-content";
import { MIN_INDEXABLE_RESULTS, pageMetadata } from "@/lib/seo";

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

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const r = resolve(params.seg1);
  if (!r) return pageMetadata({ title: "Не найдено", noindex: true });
  const filter =
    r.kind === "modality"
      ? { modality: r.modality.key }
      : { city: r.city.label };
  const count = (await listPublicProfiles(filter)).length;
  const noindex = count < MIN_INDEXABLE_RESULTS;
  if (r.kind === "modality") {
    return pageMetadata({
      title: `${r.modality.label} — массажисты`,
      description: `Профессиональные специалисты: ${r.modality.label}.`,
      path: `/therapists/${params.seg1}`,
      noindex,
    });
  }
  return pageMetadata({
    title: `Массажисты — ${r.city.label}`,
    description: `Профессиональные массажисты в городе ${r.city.label}.`,
    path: `/therapists/${params.seg1}`,
    noindex,
  });
}

export default function TherapistsFilterPage({ params }: Params) {
  const r = resolve(params.seg1);
  if (!r) notFound();

  const base = [
    { name: "Главная", path: "/" },
    { name: "Каталог специалистов", path: "/therapists" },
  ];

  if (r.kind === "modality") {
    return (
      <DirectoryView
        title={`${r.modality.label}`}
        subtitle="Профессиональные специалисты данного направления"
        filter={{ modality: r.modality.key }}
        path={`/therapists/${params.seg1}`}
        breadcrumb={[
          ...base,
          {
            name: r.modality.label,
            path: `/therapists/${params.seg1}`,
          },
        ]}
        content={landingContent({
          modalityKey: r.modality.key,
          modalityLabel: r.modality.label,
        })}
      />
    );
  }
  return (
    <DirectoryView
      title={`Массажисты — ${r.city.label}`}
      subtitle="Профессиональные специалисты в вашем городе"
      filter={{ city: r.city.label }}
      path={`/therapists/${params.seg1}`}
      breadcrumb={[
        ...base,
        { name: r.city.label, path: `/therapists/${params.seg1}` },
      ]}
      content={landingContent({ cityLabel: r.city.label })}
    />
  );
}
