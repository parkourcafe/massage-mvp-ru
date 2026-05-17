import type { Metadata } from "next";
import { DirectoryView } from "@/components/DirectoryView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Каталог массажистов",
  description:
    "Каталог независимых профессиональных массажистов: классический, лечебный, спортивный, расслабляющий массаж.",
  path: "/therapists",
});

export default function TherapistsPage() {
  return (
    <DirectoryView
      title="Каталог специалистов"
      subtitle="Независимые профессиональные массажисты"
      filter={{}}
      path="/therapists"
    />
  );
}
