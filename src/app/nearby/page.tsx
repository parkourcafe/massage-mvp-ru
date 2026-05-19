import type { Metadata } from "next";
import { NearbyExplorer } from "@/components/NearbyExplorer";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Массаж рядом — проверенные мастера поблизости",
  description:
    "Разрешите геолокацию и найдите проверенных массажистов, которые сейчас работают рядом с вами. Точный адрес мастера не раскрывается.",
  path: "/nearby",
});

export default function NearbyPage() {
  return (
    <div className="container-px py-10 sm:py-14">
      <span className="eyebrow">Рядом с вами</span>
      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        Массаж рядом — сейчас
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Только проверенные мастера, которые сами включили доступность.
        Профессиональный оздоровительный массаж — без эротического и
        «специального» контента.
      </p>
      <div className="mt-8">
        <NearbyExplorer />
      </div>
    </div>
  );
}
